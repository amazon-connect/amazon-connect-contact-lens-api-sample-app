'use strict';
console.log('Loading function');
const https = require('https');
const url = require('url');
var AWS = require('aws-sdk');
var connect = new AWS.Connect();

exports.handler = (event, context, callback) => {
    console.log('Received Event from CFT:', JSON.stringify(event));
    let responseStatus = 'FAILED';
    let responseData = {};
    if (event.RequestType === 'Create') {
      var AgentWhisperFlowArn = "";
      var QueueTransferFlowArn = "";
      var LambdaFunctionArn = event.ResourceProperties.LAMBDA_FUNCTION_ARN
      var QueueArn = event.ResourceProperties.BASIC_QUEUE_ARN
      var FraudQueueArn = event.ResourceProperties.FRAUD_QUEUE_ARN

      console.log('Creating Agent Whisper Flow ...');

      var createAgentWhisperFlowParams = {
        Content: '{\"Version\":\"2019-10-30\",\"StartAction\":\"972f79ac-8043-43e0-bd96-f64ea17cdb18\",\"Metadata\":{\"entryPointPosition\":{\"x\":31,\"y\":14},\"snapToGrid\":false,\"ActionMetadata\":{\"a4be8ae8-5229-445a-ac59-0a475b638269\":{\"position\":{\"x\":1143,\"y\":34}},\"fb4740aa-6c0a-4036-92f8-f1347d06702b\":{\"position\":{\"x\":872,\"y\":13},\"useDynamic\":false},\"b38796c1-ce89-474f-8ba2-5785d7f39628\":{\"position\":{\"x\":872,\"y\":221},\"useDynamic\":false},\"972f79ac-8043-43e0-bd96-f64ea17cdb18\":{\"position\":{\"x\":189,\"y\":19}},\"f03bb986-1a66-4d3d-bbdf-8eb2a664085c\":{\"position\":{\"x\":515,\"y\":11},\"conditionMetadata\":[{\"id\":\"e6464203-d75c-4351-8d5d-92f5599685d2\",\"operator\":{\"name\":\"Equals\",\"value\":\"Equals\",\"shortDisplay\":\"=\"},\"value\":\"true\"}]}}},\"Actions\":[{\"Identifier\":\"a4be8ae8-5229-445a-ac59-0a475b638269\",\"Parameters\":{},\"Transitions\":{},\"Type\":\"EndFlowExecution\"},{\"Identifier\":\"fb4740aa-6c0a-4036-92f8-f1347d06702b\",\"Parameters\":{\"Text\":\"Transfer from agent $.Attributes.trAgentFName $.Attributes.trAgentLName for reason $.Attributes.matchedRules\"},\"Transitions\":{\"NextAction\":\"a4be8ae8-5229-445a-ac59-0a475b638269\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"MessageParticipant\"},{\"Identifier\":\"b38796c1-ce89-474f-8ba2-5785d7f39628\",\"Parameters\":{\"Text\":\"Transfer from agent $.Attributes.trAgentFName $.Attributes.trAgentLName\"},\"Transitions\":{\"NextAction\":\"a4be8ae8-5229-445a-ac59-0a475b638269\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"MessageParticipant\"},{\"Identifier\":\"972f79ac-8043-43e0-bd96-f64ea17cdb18\",\"Parameters\":{\"FlowLoggingBehavior\":\"Enabled\"},\"Transitions\":{\"NextAction\":\"f03bb986-1a66-4d3d-bbdf-8eb2a664085c\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateFlowLoggingBehavior\"},{\"Identifier\":\"f03bb986-1a66-4d3d-bbdf-8eb2a664085c\",\"Parameters\":{\"ComparisonValue\":\"$.Attributes.hasAnyMatchedRule\"},\"Transitions\":{\"NextAction\":\"b38796c1-ce89-474f-8ba2-5785d7f39628\",\"Errors\":[{\"NextAction\":\"b38796c1-ce89-474f-8ba2-5785d7f39628\",\"ErrorType\":\"NoMatchingCondition\"}],\"Conditions\":[{\"NextAction\":\"fb4740aa-6c0a-4036-92f8-f1347d06702b\",\"Condition\":{\"Operator\":\"Equals\",\"Operands\":[\"true\"]}}]},\"Type\":\"Compare\"}]}',
        InstanceId: process.env.CONNECT_INSTANCE_ID,
        Name: event.ResourceProperties.AGENT_WHISPER_FLOW_NAME,
        Type: 'AGENT_WHISPER', /* required */
        Description: 'CLRT - Agent Whisper Flow',
      };
      connect.createContactFlow(createAgentWhisperFlowParams, function(err, data) {   
        if (err){
            responseData = {
              Error: 'Create Agent Whisper Flow operation failed'
            };
            console.log(err, err.stack); // an error occurred
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        }
        else{
            responseData.agentWhisperFlowArn = data.ContactFlowArn;
            responseData.agentWhisperFlowId = data.ContactFlowId;
            console.log(JSON.stringify(data));           // successful response
            console.log('Creating Queue Transfer Flow ...');

            AgentWhisperFlowArn = data.ContactFlowArn;
        
            var createQueueTransferFlowParams = {
              Content: '{\"Version\":\"2019-10-30\",\"StartAction\":\"ae671e06-3f59-4766-a23a-f5337108583b\",\"Metadata\":{\"entryPointPosition\":{\"x\":15,\"y\":22},\"snapToGrid\":false,\"ActionMetadata\":{\"ae671e06-3f59-4766-a23a-f5337108583b\":{\"position\":{\"x\":187,\"y\":22}},\"a645112c-b014-4656-a6eb-d89f21262bb7\":{\"position\":{\"x\":2053,\"y\":291}},\"006ffd66-2644-421f-887d-fb6689337e88\":{\"position\":{\"x\":431,\"y\":17},\"contactFlow\":{\"id\":\"' + AgentWhisperFlowArn + '\",\"text\":\"CLRT - Agent Whisper\"},\"customerOrAgent\":false,\"useDynamic\":false},\"77fa37ba-18eb-456c-933c-caf203ae8fac\":{\"position\":{\"x\":719,\"y\":18},\"dynamicMetadata\":{\"ContactId\":true},\"useDynamic\":false},\"45131d32-c595-4da0-b77c-fc3764ba1a84\":{\"position\":{\"x\":1657,\"y\":432},\"useDynamic\":false},\"daa70469-3d37-414e-be9f-5c87588f9aed\":{\"position\":{\"x\":1542,\"y\":9}},\"12c19eea-d5a9-4f1e-830b-d54c28343b44\":{\"position\":{\"x\":1808,\"y\":10},\"useDynamic\":false},\"767a4953-639b-4ae3-a0c8-42ed9d4eaf16\":{\"position\":{\"x\":998,\"y\":11}},\"b15fb791-c802-40b6-a208-922c9e3f2db2\":{\"position\":{\"x\":1281,\"y\":15},\"conditionMetadata\":[{\"id\":\"27b1a2c3-54a9-4238-a602-1a17a739ed42\",\"operator\":{\"name\":\"Equals\",\"value\":\"Equals\",\"shortDisplay\":\"=\"},\"value\":\"true\"}]}}},\"Actions\":[{\"Identifier\":\"ae671e06-3f59-4766-a23a-f5337108583b\",\"Parameters\":{\"FlowLoggingBehavior\":\"Enabled\"},\"Transitions\":{\"NextAction\":\"006ffd66-2644-421f-887d-fb6689337e88\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateFlowLoggingBehavior\"},{\"Identifier\":\"a645112c-b014-4656-a6eb-d89f21262bb7\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}},{\"Identifier\":\"006ffd66-2644-421f-887d-fb6689337e88\",\"Parameters\":{\"EventHooks\":{\"AgentWhisper\":\"' + AgentWhisperFlowArn + '\"}},\"Transitions\":{\"NextAction\":\"77fa37ba-18eb-456c-933c-caf203ae8fac\",\"Errors\":[{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"UpdateContactEventHooks\"},{\"Identifier\":\"77fa37ba-18eb-456c-933c-caf203ae8fac\",\"Parameters\":{\"LambdaFunctionARN\":\"' + LambdaFunctionArn + '\",\"InvocationTimeLimitSeconds\":\"8\",\"LambdaInvocationAttributes\":{\"ContactId\":\"$.InitialContactId\"}},\"Transitions\":{\"NextAction\":\"767a4953-639b-4ae3-a0c8-42ed9d4eaf16\",\"Errors\":[{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"InvokeLambdaFunction\"},{\"Identifier\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"Parameters\":{\"Text\":\"An error has occurred\"},\"Transitions\":{\"NextAction\":\"a645112c-b014-4656-a6eb-d89f21262bb7\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"MessageParticipant\"},{\"Identifier\":\"daa70469-3d37-414e-be9f-5c87588f9aed\",\"Parameters\":{\"Attributes\":{\"matchedRules\":\"$.External.matchedRules\"}},\"Transitions\":{\"NextAction\":\"12c19eea-d5a9-4f1e-830b-d54c28343b44\",\"Errors\":[{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"UpdateContactAttributes\"},{\"Identifier\":\"12c19eea-d5a9-4f1e-830b-d54c28343b44\",\"Transitions\":{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"Errors\":[{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"NoMatchingError\"},{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"QueueAtCapacity\"}],\"Conditions\":[]},\"Type\":\"TransferContactToQueue\"},{\"Identifier\":\"767a4953-639b-4ae3-a0c8-42ed9d4eaf16\",\"Parameters\":{\"Attributes\":{\"trAgentFName\":\"$.Agent.FirstName\",\"hasAnyMatchedRule\":\"$.External.hasAnyMatchedRule\",\"realtimeContactLensAnalytics\":\"$.External.realtimeContactLensAnalytics\",\"trAgentLName\":\"$.Agent.LastName\"}},\"Transitions\":{\"NextAction\":\"b15fb791-c802-40b6-a208-922c9e3f2db2\",\"Errors\":[{\"NextAction\":\"45131d32-c595-4da0-b77c-fc3764ba1a84\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"UpdateContactAttributes\"},{\"Identifier\":\"b15fb791-c802-40b6-a208-922c9e3f2db2\",\"Parameters\":{\"ComparisonValue\":\"$.External.hasAnyMatchedRule\"},\"Transitions\":{\"NextAction\":\"12c19eea-d5a9-4f1e-830b-d54c28343b44\",\"Errors\":[{\"NextAction\":\"12c19eea-d5a9-4f1e-830b-d54c28343b44\",\"ErrorType\":\"NoMatchingCondition\"}],\"Conditions\":[{\"NextAction\":\"daa70469-3d37-414e-be9f-5c87588f9aed\",\"Condition\":{\"Operator\":\"Equals\",\"Operands\":[\"true\"]}}]},\"Type\":\"Compare\"}]}',
              InstanceId: process.env.CONNECT_INSTANCE_ID,
              Name: event.ResourceProperties.QUEUE_TRANSFER_FLOW_NAME,
              Type: 'QUEUE_TRANSFER', /* required */
              Description: 'CLRT - Queue Transfer Flow',
            };
            connect.createContactFlow(createQueueTransferFlowParams, function(err, data) {   
              if (err){
                  responseData = {
                    Error: 'Create Queue Transfer Flow operation failed'
                  };
                  console.log(err, err.stack); // an error occurred
              }
              else{
                  responseData.queueTransferFlowArn = data.ContactFlowArn;
                  responseData.queueTransferFlowId = data.ContactFlowId;
                  console.log(JSON.stringify(data));           // successful response
                  QueueTransferFlowArn = data.ContactFlowArn;
                  console.log('Creating Contact Flow ...');
                  
                  var createContactFlowParams = {
                    Content: '{\"Version\":\"2019-10-30\",\"StartAction\":\"bed1d5d7-d935-427b-abe0-67ca4c7e3aeb\",\"Metadata\":{\"entryPointPosition\":{\"x\":319,\"y\":13},\"snapToGrid\":false,\"ActionMetadata\":{\"bed1d5d7-d935-427b-abe0-67ca4c7e3aeb\":{\"position\":{\"x\":492,\"y\":14}},\"0a12cc7d-ba50-4500-af1f-a8fc29a7be4c\":{\"position\":{\"x\":738,\"y\":15}},\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\":{\"position\":{\"x\":1576,\"y\":24}},\"3102aaf2-3d16-4ff7-95ce-52e1c347a461\":{\"position\":{\"x\":994,\"y\":13},\"useDynamic\":false,\"queue\":{\"id\":\"' + QueueArn + '\",\"text\":\"BasicQueue\"}},\"f12d5f59-232d-4def-ba75-2771e9c35f54\":{\"position\":{\"x\":1251,\"y\":13},\"useDynamic\":false}}},\"Actions\":[{\"Identifier\":\"bed1d5d7-d935-427b-abe0-67ca4c7e3aeb\",\"Parameters\":{\"FlowLoggingBehavior\":\"Enabled\"},\"Transitions\":{\"NextAction\":\"0a12cc7d-ba50-4500-af1f-a8fc29a7be4c\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateFlowLoggingBehavior\"},{\"Identifier\":\"0a12cc7d-ba50-4500-af1f-a8fc29a7be4c\",\"Parameters\":{\"RecordingBehavior\":{\"RecordedParticipants\":[\"Agent\",\"Customer\"]},\"AnalyticsBehavior\":{\"Enabled\":\"True\",\"AnalyticsMode\":\"RealTime\",\"AnalyticsLanguage\":\"en-US\",\"AnalyticsRedactionBehavior\":\"Disabled\",\"AnalyticsRedactionResults\":\"None\"}},\"Transitions\":{\"NextAction\":\"3102aaf2-3d16-4ff7-95ce-52e1c347a461\",\"Errors\":[],\"Conditions\":[]},\"Type\":\"UpdateContactRecordingBehavior\"},{\"Identifier\":\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\",\"Type\":\"DisconnectParticipant\",\"Parameters\":{},\"Transitions\":{}},{\"Identifier\":\"3102aaf2-3d16-4ff7-95ce-52e1c347a461\",\"Parameters\":{\"QueueId\":\"' + QueueArn + '\"},\"Transitions\":{\"NextAction\":\"f12d5f59-232d-4def-ba75-2771e9c35f54\",\"Errors\":[{\"NextAction\":\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\",\"ErrorType\":\"NoMatchingError\"}],\"Conditions\":[]},\"Type\":\"UpdateContactTargetQueue\"},{\"Identifier\":\"f12d5f59-232d-4def-ba75-2771e9c35f54\",\"Transitions\":{\"NextAction\":\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\",\"Errors\":[{\"NextAction\":\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\",\"ErrorType\":\"NoMatchingError\"},{\"NextAction\":\"d5d0dc75-e67d-4a9c-9270-f00e3e2d0a5e\",\"ErrorType\":\"QueueAtCapacity\"}],\"Conditions\":[]},\"Type\":\"TransferContactToQueue\"}]}', /* required */
                    InstanceId: process.env.CONNECT_INSTANCE_ID, // PARAMETER
                    Name: event.ResourceProperties.CONTACT_FLOW_NAME, // PARAMETER
                    Type: 'CONTACT_FLOW', /* required */
                    Description: 'CLRT - Contact Flow',
                  };
                  connect.createContactFlow(createContactFlowParams, function(err, data) {   
                    if (err){
                        responseData = {
                          Error: 'Create Contact Flow operation failed'
                        };
                        console.log(err, err.stack); // an error occurred
                    }
                    else{
                        responseData.contactFlowArn = data.ContactFlowArn;
                        responseData.contactFlowId = data.ContactFlowId;
                        console.log(JSON.stringify(data));           // successful response
                        console.log('Creating Quick Connect ...');

                        var params = {
                          InstanceId: process.env.CONNECT_INSTANCE_ID, // PARAMETER
                          Name: event.ResourceProperties.QUICK_CONNECT_NAME, /* required */
                          QuickConnectConfig: { /* required */
                            QuickConnectType: 'QUEUE', /* required */
                            QueueConfig: {
                              ContactFlowId: QueueTransferFlowArn, /* required */
                              QueueId: FraudQueueArn /* required */
                            },
                          },
                          Description: 'CLRT - Quick Connect',
                        };
                        connect.createQuickConnect(params, function(err, data) {   
                          if (err){
                              responseData = {
                                Error: 'Create Quick Connect operation failed'
                              };
                              console.log(err, err.stack); // an error occurred
                          }
                          else{
                              responseData.quickConnectARN = data.QuickConnectARN;
                              responseData.quickConnectId = data.QuickConnectId;
                              responseStatus = 'SUCCESS';
                              sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                              console.log(JSON.stringify(data));           // successful response
                              callback(null, responseData);
                        }  
                      });                         
                    }  
                  });   
              }  
            });   
      }  
    });   
    } else if (event.RequestType === 'Update' || event.RequestType === 'Delete') {
      responseStatus = 'SUCCESS';
      sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
    }
};

/**
* Sends a response to the pre-signed S3 URL
*/
let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
  const responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
      PhysicalResourceId: logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData,
  });
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'PUT',
      headers: {
          'Content-Type': '',
          'Content-Length': responseBody.length,
      }
  };
  const req = https.request(options, (res) => {
      callback(null, 'Successfully sent stack response!');
  });
  req.on('error', (err) => {
      console.log('sendResponse Error:\n', err);
      callback(err);
  });
  req.write(responseBody);
  req.end();
};