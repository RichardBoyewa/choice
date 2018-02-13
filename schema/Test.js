const {
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLObjectType,
} = require('graphql');
const { OptionType, OptionInputType } = require ('./Option')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { StatisticModel } = require('./Statistic');
const { DecisionModel } = require('./Decision');

const TestSchema = new Schema({
  name: String,
  options: [
    {
      label: String,
      weight: Number,
      elected: { type: Boolean, default: false }
    }
  ]
});

TestSchema.post('save', async (test) => {

  test.options.forEach( async (option) => {
    await new StatisticModel({optionId: option._id, decisionCount: 0}).save()
  })

});

TestSchema.pre('save', function(next)  {
  let found = false
  this.options.forEach( (option) => {
    if (found && option.elected) {
      throw new Error('Mh. We cannot have more than one elected option')
    }
    if (!found && option.elected) {
      found = true
    }
  })
  next()

});

const TestModel = mongoose.model('Test', TestSchema)

const TestType = new GraphQLObjectType({
  name: "Test",
  description: "This type represents a Test",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString)},
    name: {type: new GraphQLNonNull(GraphQLString)},
    options: {type: new GraphQLList(OptionType)},
    totalOptionsDecisions: {
      type: GraphQLInt,
      resolve: async (test) => {
        let total = 0

        await Promise.all(test.options.map(async (option) => {
          const stat = await StatisticModel.findOne({optionId: option._id})
          total += stat.decisionCount
        }));

        return total
      }
    }
  })
});

const DecisionTestType = new GraphQLObjectType({
    name: "DecisionTest",
    description: "This type represents a return test when a decision is asked",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        options: {type: new GraphQLList(OptionType)},
        uuid: {type: GraphQLString},
    })
});

const ConvertedDecisionTestType = new GraphQLObjectType({
    name: "ConvertedDecisionTest",
    description: "This type represents a return a converted decision",
    fields: () => ({
        uuid: {type: new GraphQLNonNull(GraphQLString)},
        testName: {type: new GraphQLNonNull(GraphQLString)},
        testId: {type: new GraphQLNonNull(GraphQLString)},
        converted: {type: new GraphQLNonNull(GraphQLBoolean)}
    })
});

const TestInputType = new GraphQLInputObjectType({
  name: 'TestInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    options: {type: new GraphQLList(OptionInputType)}
  })
});

const TestMutationType = new GraphQLObjectType({
  name: "TestMutations",
  description: "Tests Mutations",
  fields: () => ({
    addTest: {
      type: TestType,
      description: 'Create a new test',
      args: {
        test: { type: TestInputType }
      },
      resolve: async (value, { test }) => {
        //Before pushing anything we check if weight is okay
        let sum = 0
        test.options.forEach((option) => {
          sum += option.weight
        })

        if (sum !== 100)
          throw new Error('Sum of options weight should be 100 percent')

        return await new TestModel(test).save();
      }
    },
    addTestOption: {
      type: TestType,
      description: 'Add a new option to a test',
      args: {
        name: { type: GraphQLString },
        option: { type: OptionInputType }
      },
      resolve: async (value, { name, option }) => {
        const instance = await TestModel.find({name: name})

        //Before pushing anything we check if weight is okay
        let sum = 0
        instance.options.forEach((option) => {
          sum += option.weight
        })

        if (sum !== 100)
          throw new Error('Sum of options weight should be 100 percent')

        await instance.options.push(option)
        return await instance.save()
      }
    },
    takeDecision: {
      type: DecisionTestType,
      description: 'Take a decision and return a selected value',
      args: {
        name: { type: GraphQLString },
        uuid: { type: GraphQLString }
      },
      resolve: async (value, { name, uuid }) => {

        const previousDecision = await DecisionModel.findOne({testName: name, uuid: uuid})
        if (previousDecision) {
          await StatisticModel.findOneAndUpdate({optionId: previousDecision.selectedOption._id}, {$inc : {'displayCount' : 1}})
          return {id: previousDecision.testId, name: name, uuid: uuid, options: [previousDecision.selectedOption]}
        }

        //Get instance
        const instance = await TestModel.findOne({name: name})

        const decision = Math.floor(Math.random() * 101)

        /* for instance: */
        /* 0%----option1-- 20% --option2----30%-----option3-----------100% */

        let cumulatedCursor = 0

        let selectedOption

        instance.options.forEach((option, index) => {
          if (option.elected)
            selectedOption = option

          cumulatedCursor += option.weight
          if (!selectedOption && decision <= cumulatedCursor) {
            selectedOption = option
          }
        })

        await StatisticModel.findOneAndUpdate({optionId: selectedOption._id}, {$inc : {'decisionCount' : 1, 'displayCount': 1}})

        const freshDecision = await new DecisionModel({testId: instance._id, testName: instance.name, selectedOption: selectedOption, uuid: uuid}).save()

        return {id: instance._id, name: name, options: [selectedOption], uuid: freshDecision.uuid}

      }
    },
    trackConversion: {
      type: ConvertedDecisionTestType,
      description: 'Track conversion for a particular user and test',
      args: {
          name: { type: GraphQLString },
          uuid: { type: GraphQLString }
      },
      resolve: async (value, { name, uuid }) => {
        const previousDecision = await DecisionModel.findOne({testName: name, uuid: uuid})
        if (previousDecision && !previousDecision.converted) {
          previousDecision.converted = true
          await previousDecision.save()
          await StatisticModel.findOneAndUpdate({optionId: previousDecision.selectedOption._id}, {$inc : {'conversionCount': 1}})
        }
        return {testId: previousDecision.testId, testName: previousDecision.testName, converted: previousDecision.converted, uuid: previousDecision.uuid}

      }
    },
    toggleElectOption: {
      type: TestType,
      description: 'Stop test and say it will be the only returned option for this test.',
      args: {
        optionId: { type: GraphQLString },
        testId: { type: GraphQLString }
      },
      resolve: async (value, { optionId, testId }) => {
        const test = await TestModel.findById(testId)

        test.options.forEach( async (option) => {
          if (option._id.toString() === optionId) {
            option.elected = !option.elected
          } else {
            option.elected = false
          }
        })

        return await test.save()

      }
    }
  })
})

module.exports = {
  TestModel: TestModel,
  TestType: TestType,
  TestInputType: TestInputType,
  TestMutationType: TestMutationType
}