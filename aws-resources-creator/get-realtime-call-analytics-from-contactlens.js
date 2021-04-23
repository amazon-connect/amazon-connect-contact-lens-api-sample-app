const AWS = require('aws-sdk');
const connectcontactlens = new AWS.ConnectContactLens({apiVersion: '2020-08-21'});
var fs = require("fs");

exports.handler = (event, context, callback) => {
    console.log('Received Event from Amazon Connect:', JSON.stringify(event));

    var nextToken = null;
    var index;
    var matchedRules = '';
    var hasAnyMatchedRule = false;
    var matchedCategory = '';
    var categoryBeginOffsetMillis;
    var categoryEndOffsetMillis;
    var transacriptionBeginOffsetMillis;
    var transacriptionEndOffsetMillis;
    var transcripts = [];

    // parameters fetched from the JSON event recieved from Amazon Connect
    var ContactId = event.Details.Parameters.ContactId;
    var InstanceId = (event.Details.ContactData.InstanceARN).split(':')[5].split('/')[1];
    console.log('Received InstanceId from Amazon Connect: ', InstanceId);
    
    var params = {
      ContactId:  ContactId, /* required */
      InstanceId: InstanceId, /* required */
      MaxResults: 100,
    };
    
    connectcontactlens.listRealtimeContactAnalysisSegments(params, function (err, data) {
      if (err){
          console.log(err, err.stack); // an error occurred
      }
      else{
          console.log(JSON.stringify(data));           // successful response
          const segments = data.Segments;
          if(segments) {
            for (index = 0; index < segments.length; ++index) {
                // console.log(segments[index]);
                if(segments[index].Categories) {
                  hasAnyMatchedRule = true;
                  categoryBeginOffsetMillis = segments[index].Categories.MatchedDetails.Fraud.PointsOfInterest[0].BeginOffsetMillis;
                  categoryEndOffsetMillis = segments[index].Categories.MatchedDetails.Fraud.PointsOfInterest[0].EndOffsetMillis;
                  const matched_categories = segments[index].Categories.MatchedCategories;
                  for (const matched_category of matched_categories){
                    // console.log('category: ', matched_category);
                    matchedCategory = matched_category;
                    matchedRules += matched_category + ", ";
                  }
                  if(segments[index+1].Transcript){
                    // console.log('Found!');
                    transacriptionBeginOffsetMillis = segments[index+1].Transcript.BeginOffsetMillis;
                    transacriptionEndOffsetMillis = segments[index+1].Transcript.EndOffsetMillis;
                    if(categoryBeginOffsetMillis === transacriptionBeginOffsetMillis && categoryEndOffsetMillis === transacriptionEndOffsetMillis){
                      // console.log('Match Found!');
                      var participantRole = segments[index+1].Transcript.ParticipantRole;
                      var transcript = segments[index+1].Transcript.Content;
                      var sentiment = segments[index+1].Transcript.Sentiment;
                      transcripts.push({
                        participant: participantRole,
                        transcript: transcript,
                        sentiment: sentiment,
                        matchedCategory: matchedCategory
                      });
                      matchedCategory = '';
                    }
                  }
                } else if (segments[index].Transcript) {
                    var participantRole = segments[index].Transcript.ParticipantRole;
                    var transcript = segments[index].Transcript.Content;
                    var sentiment = segments[index].Transcript.Sentiment;
                    transcripts.push({
                      participant: participantRole,
                      transcript: transcript,
                      sentiment: sentiment,
                      matchedCategory: matchedCategory
                    });
                  }
            }
            const seen = new Set();
            const filteredTranscripts = transcripts.filter(el => {
              const duplicate = seen.has(el.transcript);
              seen.add(el.transcript);
              return !duplicate;
            });
            
            console.log(filteredTranscripts);
            console.log('Matched Rules: ' + matchedRules); 
            
            var resultMap = {
              hasAnyMatchedRule:hasAnyMatchedRule,
              realtimeContactLensAnalytics:JSON.stringify(filteredTranscripts),
              matchedRules:matchedRules.trim().replace(/,$/, '')
            }
          
            console.log(resultMap);
          } else {
            var resultMap = {
              hasAnyMatchedRule:hasAnyMatchedRule
            }
          }
          callback(null, resultMap);
    }  
  });   
};
