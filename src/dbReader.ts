import { webContents } from "electron";
import { Connection, createConnection, Repository, Brackets } from 'typeorm';
import { Match } from './entities/Match';

// const ipc = require("electron-better-ipc");


export class DBReader
{
    mainWebContents: webContents;

    private connection: Connection;

    MatchRepository: Repository<Match>;

    

    constructor()
    {
        // ipc.answerMain("establishDBConnection", this.establishDBConnection.bind(this));
        // ipc.answerMain("getDBInfo", this.getDBInfo.bind(this));
        // ipc.answerMain("getConversations", this.getConversations.bind(this));
        // ipc.answerMain("getRelevantMessages", this.getRelevantMessages.bind(this));
        // ipc.answerMain("getCurrentParticipants", this.getCurrentParticipants.bind(this));
        // ipc.answerMain("getCurrentContacts", this.getCurrentContacts.bind(this));
        // ipc.answerMain("getCurrentMessages", this.getCurrentMessages.bind(this)); //from exporter

        // //'from' exoporter
        // ipc.answerMain("getFirstAndLastMessageOfConvo", this.getFirstAndLastMessageOfConvo.bind(this));
        // ipc.answerMain("getAllFileAndLinkMessagesFromDBOwner", this.getAllFileAndLinkMessagesFromDBOwner.bind(this));
        // ipc.answerMain("getConvoDisplayname", this.getConvoDisplayname.bind(this));
        // ipc.answerMain("getParticipantsForTimeOfCrime", this.getParticipantsForTimeOfCrime.bind(this));

        // ipc.answerMain("setFileIsOk", this.setFileIsOk.bind(this));
        console.log("DBReader", "reader inited");
    }

    // public set CacheDBreader(reader: CacheDBReader)
    // { this.cacheDBReader = reader; }
    

    async establishDBConnection(filePath: string)
    {        
        this.connection = await this.openConnection(filePath);
        
        this.MatchRepository = this.connection.getRepository(
            Match
        );
        
        let numMatches = await this.MatchRepository.createQueryBuilder().getCount();
        console.log("just testing the connection: numMatches", numMatches);

        //test match table
        try{
            await this.MatchRepository.find({ order: { creation: "ASC" } });
        }catch(e){
            console.error("handled error:", e);
            return e;
        }

        console.log("DBReader", "db connection established");

        //inserting prevously generated messages into opened file
        // if(usableMessages){
        //     for(let i = 0; i < usableMessages.length; i++)
        //     {
        //         await this.messageRepository.save(usableMessages[i]);
        //     }
        //     let messagesOld = await this.messageRepository.find({ convo_id: 216 });
        //     console.log(messagesOld);
        // }

        // if(usableConversation){
        //     await this.conversationRepository.save(usableConversation);
        //     let conversationOld = await this.conversationRepository.find({ id: 216 });
        //     console.log(conversationOld);
        // }
        return 0;
    }

    async getNumMatches(){
      return await this.MatchRepository.createQueryBuilder().getCount();
    }

    async getNumWins(){
      return await this.MatchRepository.createQueryBuilder().where("outcome = 1").getCount();
    }

    async getNumLoses(){
      return await this.MatchRepository.createQueryBuilder().where("outcome = 2").getCount();
    }

    async getMostRecentGameTimestamp(){
      let res = await this.MatchRepository.createQueryBuilder().select("MAX(creation)", "max").getRawOne();
      return res.max;
    }

    async getAllMatchIds(){
      return await this.MatchRepository.createQueryBuilder().select("gameId").getRawMany();
    }

    async getMatchById(matchId: number){
      return await this.MatchRepository.find({ where: { gameId: matchId} });
    }

    async openConnection(filePath: string)
    {
        if (this.connection && this.connection.isConnected) {
            console.log("DBReader", "Closing old connection...");
            try {
                await this.connection.close();
            } catch (e) {
                console.log("DBReader", e);
            }
            console.log("DBReader", "Old connection closed");
        }
        else { console.log("DBReader", "No old connection"); }

        console.log("DBReader", "Opening new connection...");
        
        let connectionTemp: Connection;
        try{
          connectionTemp = await createConnection({
              type: "sqljs",
              location: filePath,
              entities: [Match],
              name: "MyConnection1"
          });
          console.log("DBReader", "OPEN_1");
        } catch (e){
          connectionTemp = await createConnection({
            type: "sqljs",
            location: filePath,
            entities: [Match],
            name: "MyConnection2"
          });
          console.log("DBReader", "OPEN_2");
        }

        return connectionTemp;
    }

    async getDBInfo()
    {
//         console.log("DBReader", "getDBInfo");
//         if(this.fileIsOk != 1)
// {
//         console.log("DBReader nope");    
//         return null;
// }
//         let dbInfo = new DBInfo();

//         switch(this.dbFormat) {
//             case DBFormat.V1: let account = await this.accountRepository.createQueryBuilder().getOne();
//                 if (account != undefined)
//                     dbInfo.account = account;
    
//                 let transfersRepository: Repository<Transfers> = this.connection.getRepository(
//                     Transfers
//                 );
                
//                 dbInfo.numFileTransfers = await transfersRepository.createQueryBuilder().getCount();
                
//                 dbInfo.numConversations = await this.conversationV1Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numContacts = await this.contactsV1Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numMessages = await this.messageV1Repository.createQueryBuilder().getCount();
                
//                 dbInfo.firstMessage = await this.messageV1Repository.createQueryBuilder().addSelect("MIN(timestamp__ms)").getOne();
//                 dbInfo.lastMessage = await this.messageV1Repository.createQueryBuilder().addSelect("MAX(timestamp__ms)").getOne();
//                 dbInfo.dbFormat = DBFormat.V1;
//                 break;    
//             case DBFormat.V2: let keyValueRepository = await this.connection.getRepository(key_value);
//                 let keyValues = await keyValueRepository.createQueryBuilder().getMany();
                
//                 dbInfo.account = new Accounts(undefined, keyValues);
                
//                 dbInfo.numConversations = await this.conversationV2Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numContacts = await this.contactsV2Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numMessages = await this.messageV2Repository.createQueryBuilder().getCount();
                
//                 dbInfo.firstMessage = new MessagesV1(undefined, await this.messageV2Repository.createQueryBuilder().addSelect("MIN(originalarrivaltime)").getOne());
//                 dbInfo.lastMessage = new MessagesV1(undefined, await this.messageV2Repository.createQueryBuilder().addSelect("MAX(originalarrivaltime)").getOne());
//                 dbInfo.dbFormat = DBFormat.V2;
//                 break;
//             case DBFormat.V3: dbInfo.account = new Accounts();
                
//                 dbInfo.account.skypename = SkypeV3Helper.GetNormalName( await this.skypeV3Helper.getSkypeName());
                
//                 dbInfo.numConversations = await this.conversationV3Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numContacts = await this.contactsV3Repository.createQueryBuilder().getCount();
                
//                 dbInfo.numMessages = await this.messageV3Repository.createQueryBuilder().getCount();
                
//                 let earliestAndLatestMsgs = await this.skypeV3Helper.getFirstAndLastMessage();
//                 dbInfo.firstMessage = earliestAndLatestMsgs["earliest"];
//                 dbInfo.lastMessage = earliestAndLatestMsgs["latest"];
//                 dbInfo.dbFormat = DBFormat.V3;
//                 break;
//             }
        

//         this.currentDBOwnerSkypeName = dbInfo.account.skypename;
//         this.currentDBOwnerOriginalSkypeName = dbInfo.account.originalSkypeName;

//         this.setConvoNames();

//         return dbInfo;
    }

  

    // async getConversations(): Promise<ConversationsV1[]>
    // {
    //     if(this.fileIsOk != 1)
    //     {
    //         console.log("DBReader nope");    
    //         return null;
    //     }

    //     console.log("DBReader", "DBReader", "getConversations");

    //     //get actual Conversations
    //     let convos = [];
    //     let convosTemp: ConversationsV1[] = [];

    //     switch(this.dbFormat){
    //         case DBFormat.V1: convosTemp = await this.conversationV1Repository.createQueryBuilder().getMany();
    //                 for (let i = 0; i < convosTemp.length; i++) {
    //                     convosTemp[i].hasSharedFile = await this.convoHasSharedFile(convosTemp[i]);
                        
    //                     let whereArray = [ 
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.Added },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.CallEnded }, 
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.CallStarted },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.Left },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.SentFile },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.SharedContactDetails },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.SharedLink },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.TextMessage },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.WasRemoved },
    //                         { convo_id: convosTemp[i].id, type: SkypeMessageTypeV1.WouldLikeToAddYou }
    //                     ];
                    
    //                     let messagesCountObj = await this.messageV1Repository
    //                         .createQueryBuilder("message")
    //                         .select("COUNT(message.id)", "count")
    //                         .where(whereArray)
    //                         .getRawOne();
                        
    //                     convosTemp[i].messageCount = messagesCountObj['count'];
        
    //                     let firstMessage = await this.messageV1Repository
    //                         .createQueryBuilder()
    //                         .addSelect("MIN(timestamp)")
    //                         .where(whereArray)
    //                         .getOne();
        
    //                     if (firstMessage != null)
    //                         convosTemp[i].creation_timestamp = firstMessage.timestamp;
        
    //                     let lastMessage = await this.messageV1Repository
    //                         .createQueryBuilder()
    //                         .addSelect("MAX(timestamp)")
    //                         .where(whereArray)
    //                         .getOne();
        
    //                     if(lastMessage != null)
    //                         convosTemp[i].lastMessageTimestamp = lastMessage.timestamp;
        
    //                     if (convosTemp[i].displayname == null) {
    //                         convosTemp[i].displayname = convosTemp[i].identity;
    //                     }
    //                     convosTemp[i].isGroupChat = await this.isConvoGroupChat(convosTemp[i]);

    //                     convos.push(convosTemp[i]);
    //                 }
    //                 break;
            
    //     }

    //     convos.sort((convo1, convo2) => { return convo2.messageCount - convo1.messageCount; });
    //     //convos.sort((convo1, convo2) => { return convo2.lastMessageTimestamp - convo1.lastMessageTimestamp });

    //     return convos;
    // }


    
    //data[0]-> timestamp data[1]-> returnAllArrays:boolean
    // getCurrentParticipants(data: object)
    // {
    //     const paramater = data as {timestamp: number; returlAllArrays: boolean};
    //     let clickedMessage = this.getMessageByTimestampMS(paramater.timestamp);

    //     let clickedMessageIndex = this.allMessagesConvo.findIndex(message => message.id == clickedMessage.id);
    //     if (clickedMessageIndex == -1) return null;

    //     let joinedBeforeIdentities: String[] = [];
    //     let joinedAfterIdentities: String[] = [];
    //     let leftBeforeIdentities: String[] = [];
    //     let additionalIdentities: String[] = [];

    //     for (let i = 0; i < this.allMessagesConvo.length; i++) {
    //         let messageTemp = this.allMessagesConvo[i];

    //         //type 30 seems to be call and it may have identities which are not in the group
    //         //see message.id 13496 in 'hobbyhurensöhne' (has identity olli60bi which only later 
    //         //joined the conversation)
    //         if (messageTemp.type == SkypeMessageTypeV1.CallStarted ||
    //             messageTemp.identities == "")
    //             continue;

    //         let identitiesFromMessage: String[] = [];
    //         if (messageTemp.identities != null)
    //             identitiesFromMessage = messageTemp.identities.split(" ");

    //         if (messageTemp.type == SkypeMessageTypeV1.Added && identitiesFromMessage.length > 0) {
    //             identitiesFromMessage.forEach(identity => 
    //             {
    //                 if (i <= clickedMessageIndex) { //joined BEFORE
    //                     if (!joinedBeforeIdentities.includes(identity)) {
    //                         joinedBeforeIdentities.push(identity);

    //                         if(leftBeforeIdentities.includes(identity))
    //                         {
    //                             let index = leftBeforeIdentities.findIndex(entry => entry == identity);
    //                             leftBeforeIdentities.splice(index, 1);
    //                         }

    //                         // if (!additionalIdentities.includes(identity))
    //                         //     additionalIdentities.push(identity);
    //                     }
    //                 }
    //                 else //joined AFTER
    //                 {
    //                     if (!joinedAfterIdentities.includes(identity)) {
    //                         joinedAfterIdentities.push(identity);

    //                         if(leftBeforeIdentities.includes(identity))
    //                         {
    //                             let index = leftBeforeIdentities.findIndex(entry => entry == identity);
    //                             leftBeforeIdentities.splice(index, 1);
    //                         }
    //                     }
    //                 }
    //             });
    //         }
    //         else if ((messageTemp.type == SkypeMessageTypeV1.Left || messageTemp.type == SkypeMessageTypeV1.WasRemoved) && identitiesFromMessage.length > 0) {
    //             identitiesFromMessage.forEach(identity => 
    //             {
    //                 if (!leftBeforeIdentities.includes(identity)) {

    //                     if (i <= clickedMessageIndex) { //if convo was left BEFORE clickedMessage
    //                         // if (additionalIdentities.includes(identity)) {
    //                         //     let index = additionalIdentities.findIndex(entry => entry == identity);
    //                         //     additionalIdentities.splice(index, 1);
    //                         // }
    //                     }    //if convo was left AFTER clickedMessage
    //                     else if (i > clickedMessageIndex) {
    //                         // if(!additionalIdentities.includes(identity))
    //                         //     additionalIdentities.push(identity);
                            
                        
    //                         return; //the identity left after timeOfCrime/message so he should not be added
    //                                 //to the leftIdentities array
    //                     }



    //                     if (i <= clickedMessageIndex) {
    //                         let index = joinedBeforeIdentities.findIndex(entry => entry == identity);
    //                         if (index != -1) {
    //                             joinedBeforeIdentities.splice(index, 1);
    //                         }
    //                         index = additionalIdentities.findIndex(entry => entry == identity);
    //                         if (index != -1) {
    //                             additionalIdentities.splice(index, 1);
    //                         }
    //                     }
    //                     else {
    //                         let index = joinedAfterIdentities.findIndex(entry => entry == identity);
    //                         if (index != -1) {
    //                             joinedAfterIdentities.splice(index, 1);
    //                         }
    //                         index = additionalIdentities.findIndex(entry => entry == identity);
    //                     }

    //                     leftBeforeIdentities.push(identity);
    //                 }
    //             });
    //         }
    //         else //check ALL other types irregarding clickedMessage
    //         {
    //             //check identities
    //             identitiesFromMessage.forEach(identity => 
    //             {
    //                 if (!leftBeforeIdentities.includes(identity) &&
    //                     !joinedAfterIdentities.includes(identity) &&
    //                     !additionalIdentities.includes(identity)) {
    //                     additionalIdentities.push(identity);
    //                 }
    //             });

    //             //check author
    //             if (messageTemp.author != null &&
    //                 !leftBeforeIdentities.includes(messageTemp.author) &&
    //                 !joinedAfterIdentities.includes(messageTemp.author) &&
    //                 !additionalIdentities.includes(messageTemp.author)) {
    //                 additionalIdentities.push(messageTemp.author);
    //             }
    //         }
    //     }

    //     if (additionalIdentities.indexOf(this.currentDBOwnerSkypeName) == -1)
    //         additionalIdentities.push(this.currentDBOwnerSkypeName);


    //     let filteresIdentities = additionalIdentities.filter(identity => !joinedAfterIdentities.includes(identity));
    //     let finalIdentities = joinedAfterIdentities.concat(filteresIdentities);

    //     if(paramater.returlAllArrays)
    //     {   //only used in exporter
    //         return {identitiesWithAccess: finalIdentities, identitiesWithoutAcces: leftBeforeIdentities};
    //     }
    //     return finalIdentities;
    // }

    

    async delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
