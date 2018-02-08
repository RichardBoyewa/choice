const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLList,
  GraphQLObjectType,
  // This is the class we need to create the schema
  GraphQLSchema,
} = require('graphql');
const mongoose = require('mongoose');

const {TestType, TestModel, TestMutationType} = require ('./schema/Test')

mongoose.connect('mongodb://localhost');

// This is the Root Query
const ChoiceQueryRootType = new GraphQLObjectType({
  name: 'ChoiceSchema',
  description: "Choice Schema Query Root",
  fields: () => ({
    tests: {
      type: new GraphQLList(TestType),
      description: "List of all Tests",
      resolve: function() {
        return TestModel.find()
      }
    }
  })
});

// This is the schema declaration
const ChoiceSchema = new GraphQLSchema({
  query: ChoiceQueryRootType,
  // If you need to create or updata a datasource,
  // you use mutations. Note:
  // mutations will not be explored in this post.
  mutation: TestMutationType
});

var app = express();
app.use('/choice', graphqlHTTP({
  schema: ChoiceSchema,
  graphiql: true
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');