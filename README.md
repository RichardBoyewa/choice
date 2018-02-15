# Choice

Choice is a simple javascript framework created to run AB Test for your applications/products. 
Choice is aimed to help developers to implement AB Test in seconds. Choice is based on [express](https://github.com/expressjs/express), [graphql](https://github.com/facebook/graphql) and 
[mongodb](https://www.mongodb.com/)

![choice-screenshot](https://raw.githubusercontent.com/sleashe/choice-ui/master/public/screenshot.png)
UI is available at: [https://github.com/Sleashe/choice-ui](https://github.com/Sleashe/choice-ui)

## Philosophy & Core concepts
Choice works using _tests_. A _test_ is simply defined by a name and the available options it 
offers. An option is simply a variant for your test. A _test_ could have as many options as you 
want.

An _option_ contains a _label_ and a _weight_. When specifying a weight, Choice will try to 
deliver your options regarding the weight you provided.

Once you created a test, you can request Choice to take a decision. Choice will then return the 
most appropriate option.
 
Regarding conversion performances, you can tell Choice to **elect** an option. The elected 
option will **always** be choosen for future _take decision_ requests.
 
Choice provides statistics for your tests. Each time a decision will be taken or a conversion 
tracked, Choice will record for each option the number of **displays** (how many time this 
option has been returned), **decisions** (how many time this option has been taken) and 
**conversions** (how many time a user converted with this option). These statistics are provided 
as GraphQL fields and you can add them into your schema.
 
 ## Quick Start
 ### Using Docker
 1. Clone this repo, navigate into it, and build the choice-api image `docker build -t 
 choice .`
 2. Use following docker-compose file (`docker-compose up -d`):
 ```
 version: '3'
 services:
   choice:
     image: "choice"
     ports:
      - "80:80"
     depends_on:
       - choice-database
     environment:
       - PORT=80
       - MONGO_URL=choice-database
       - NODE_ENV=development|production
   choice-database:
     image: "mongo:3.6.0"
 ```
  ### Without Docker
  1. Make sure you have a running and accessible MongoDB database
  1. Clone this repo, navigate into it, and run `PORT=80 MONGO_URL=your-mongodb-endpoint node app
  .js`
  
  ## Documentation (GraphQL)
  ### Queries

  ```
  {
    tests {
      id
      name
      totalOptionsDecisions
      options {
        id
        label
        weight
        elected
        decisionCount
        displaysCount
        convertedCount
      }
      
    }
  }
  ```
  ### Mutations
  #### addTest
  Let you add a new test. Please make sure that the sum of options weight is equal to **100**, 
  otherwise it will throw an error.
  ```
  mutation {
    addTest(test: {
      name: String!, 
      options: [{
        label: String!
        weight: Int!
      }]
    }) 
    {
      #Returns a TestType you can query fields on
    }
  }
  ```
  #### addTestOption
  Let you add a new option. please make sure to precise the test name you want to add the option to.
  ```
  mutation {
    addTestOption({
      name: String!, 
      option: {
        label: String!
        weight: Int!
      }
    }) 
    {
      #Returns a TestType you can query fields on
    }
  }
  ```
  #### takeDecision
  Take a decision for a given test. You will receive in return a uuid (auto generated if you do 
  not provide one), and the options object containing the selected label. For future requests 
  made by the same user, make sure to store the generated uuid, and to include this uuid in all 
  future mutation calls. Choice will remember its decision and return the same selected value for
  the same user.
  
  ```
  mutation {
    takeDecision({name: String!, uuid: String})
    {
      #Returns a DecisionTestType:
      id
      name
      options(type: OptionType)
      uuid
    }
  }
  ```
  #### trackConversion
  Track a conversion for a given test and user. This will record that this option for this user 
  has been a success.
  
  ```
  mutation {
    trackConversion({name: String!, uuid: String!})
    {
      #Returns a ConvertedDecisionTestType:
      uuid
      testName
      testId
      converted
      
    }
  }
  ```
  
  #### toggleElectOption
  Elect an option inside a test using optionId and testId. Once the option is elected, you can 
  deny this option by calling the mutation again using the same arguments. When elected, the 
  option will always be choosen by Choice **for all request to takeDecision that does not provide 
  an uuid (which means that its a new user) -**. If you provide an uuid, a previous decision 
  could have been made in the past and Choice will return this previous decision instead.
    
  ```
  mutation {
    toggleElectOption({testId: String!, optionId: String!})
    {
      #Returns a TestTypeObject you can query fields on
      #example
      name
      options {
        label
      }
    }
  }
  ```
  
  #UI
  Provided screenshot shows web application that allows you to monitor each test
  performance, and elect option if you want. Please follow [https://github.com/Sleashe/choice-ui](https://github.com/Sleashe/choice-ui)
  
  ## Contribution
  **Your feedback is appreciated, and I love contributions!**
  I know the code is not perfect and feel free to comment, add features and refactor !
  
  ## Todo
   - Tests
   - Better error management
   - Improve returned types after mutations
   - Improve code quality

