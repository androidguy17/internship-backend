const _ = require("lodash");
const aws = require("aws-sdk");
const config = require("./config");




aws.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion
});

const textract = new aws.Textract();

const getText = (result, blocksMap) => {
  let text = "";

  if (_.has(result, "Relationships")) {
    result.Relationships.forEach(relationship => {
      if (relationship.Type === "CHILD") {
        relationship.Ids.forEach(childId => {
          const word = blocksMap[childId];
          if (word.BlockType === "WORD") {
            text += `${word.Text} `;
          }
          if (word.BlockType === "SELECTION_ELEMENT") {
            if (word.SelectionStatus === "SELECTED") {
              text += `X `;
            }
          }
        });
      }
    });
  }

  return text.trim();
};

const findValueBlock = (keyBlock, valueMap) => {
  let valueBlock;
  keyBlock.Relationships.forEach(relationship => {
    if (relationship.Type === "VALUE") {
      // eslint-disable-next-line array-callback-return
      relationship.Ids.every(valueId => {
        if (_.has(valueMap, valueId)) {
          valueBlock = valueMap[valueId];
          return false;
        }
      });
    }
  });

  return valueBlock;
};

const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
  const keyValues = {};

  const keyMapValues = _.values(keyMap);

  keyMapValues.forEach(keyMapValue => {
    const valueBlock = findValueBlock(keyMapValue, valueMap);
    const key = getText(keyMapValue, blockMap);
    const value = getText(valueBlock, blockMap);
    keyValues[key] = value;
  });

  return keyValues;
};

const getKeyValueMap = blocks => {
  const keyMap = {};
  const valueMap = {};
  const blockMap = {};

  let blockId;
  blocks.forEach(block => {
    blockId = block.Id;
    blockMap[blockId] = block;

    if (block.BlockType === "KEY_VALUE_SET") {
      if (_.includes(block.EntityTypes, "KEY")) {
        keyMap[blockId] = block;
      } else {
        valueMap[blockId] = block;
      }
    }
  });

  return { keyMap, valueMap, blockMap };
};

module.exports = async buffer => {
  var company = "nope idea";

  const params = {
    Document: {
      /* required */
      Bytes: buffer
    },
    FeatureTypes: ["FORMS"]
  };

  const request = textract.analyzeDocument(params);
  const data = await request.promise();
  

  var d = data['Blocks']

  d.forEach(e => {
    if(e['BlockType']==='WORD'){
      console.log(e['Text'])

      
// ADD here #############################
      
      switch(e['Text']){

        case 'Oriental':
          {
            console.log("yes oriental");
            company ='Oriental'
          }break;

        case 'WellCare':{
          console.log("yes Wellcare");
          company = 'WellCare'
        }break;

        case 'Cigna':{
          console.log("yes Cigna");
          company = 'Cigna'
        }break;
      
        case 'EmblemHealth':{
          console.log("yes EmblemHealth");
          company = 'EmblemHealth'
        }break;

        default: {
        console.log("nahi pata");
        }
         break;
      }

     

    }


    
  });
  //console.log(data)
  


  if (data && data.Blocks) {
    const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
    const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);

    try{

      // ADD here #############################

      switch(company){

        case 'WellCare':{

          const name = keyValues["Member:"]
          const firstname=name.split(' ')[0];
          const lastname = name.split(' ')[1];
          const policy = keyValues["Policy #:"]
          const valid_from = keyValues["Card Issued:"]

          const template = {
            firstname,
            lastname,
            policy,
            valid_from
          }

          const object = {
            company,
            keyValues,
            template
          }

          return object


        } break;

        case 'Oriental':{

          const name = keyValues["Name"]
          const firstname=name.split(' ')[0];
          const lastname = name.split(' ')[1];
          const policy = keyValues["Pol. No."]
          const valid_from = keyValues["Valid From"]

          const template = {
            firstname,
            lastname,
            policy,
            valid_from
          }

          const object = {
            company,
            keyValues,
            template
          }
          return object

        } break; 

        case 'Cigna':{

          const name = keyValues['Name:']
          const firstname=name.split(' ')[0];
          const lastname = name.split(' ')[1];
          const policy = keyValues['ID:']
          const valid_from = ""

          const template = {
            firstname,
            lastname,
            policy,
            valid_from
          }

          const object = {
            company,
            keyValues,
            template
          }
          return object

        } break;

        case 'EmblemHealth\'':{

          const name = keyValues['MEMBER:']
          const firstname=name.split(' ')[0];
          const lastname = name.split(' ')[1];
          const policy = keyValues['ID NUMBER:']
          const valid_from = ""

          const template = {
            firstname,
            lastname,
            policy,
            valid_from
          }

          const object = {
            company,
            keyValues,
            template
          }
          return object

        } break;

        default: {
          const firstname = "  ";
          const lastname = "  ";
          const policy = "  "
          const valid_from = "  "

          const template = {
            firstname,
            lastname,
            policy,
            valid_from
          }

          const object = {
            company,
            keyValues,
            template
          }

          return object
        }
      }
      
      

    }catch(e){
      console.log(e);


    }



    return keyValues;
  }

  // in case no blocks are found return undefined
  return undefined;
};