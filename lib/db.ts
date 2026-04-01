import { MongoClient } from "mongodb";

if(!process.env.MONGODB_URI){
    throw new Error('Please add MONGODB_URI to your .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'civicFix';


let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if(process.env.NODE_ENV === 'development'){
    let globalwithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    }

    if(!globalwithMongo._mongoClientPromise){
        client = new MongoClient(uri);
        globalwithMongo._mongoClientPromise = client.connect()
    }

    clientPromise = globalwithMongo._mongoClientPromise;
}
else{
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function connectToDatabase(){
    const client = await clientPromise;
    const db = client.db(dbName);
    return {client, db};
}