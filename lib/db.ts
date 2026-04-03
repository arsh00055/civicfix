import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to your .env.local');
}

const uri    = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME || 'civicfix';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

let indexesEnsured = false;

async function ensureIndexes(db: Db) {
  if (indexesEnsured) return;
  indexesEnsured = true;

  try {
    const issues = db.collection('issues');

    // GET /api/issues — filters by status/category/priority, sorts by createdAt
    await issues.createIndex({ status: 1, createdAt: -1 });
    await issues.createIndex({ category: 1, createdAt: -1 });
    await issues.createIndex({ priority: 1, createdAt: -1 });

    // Reporter's own issues (GET /api/issues/my-reports)
    await issues.createIndex({ reporterId: 1, createdAt: -1 });

    // Volunteer task queries — finding issues assigned to a specific volunteer
    await issues.createIndex({ assignedToId: 1, status: 1 });

    // Vote dedup — checking if a user already voted (voters is an array field)
    await issues.createIndex({ voters: 1 });

    // Text search across title, description, location
    await issues.createIndex(
      { title: 'text', description: 'text', location: 'text' },
      { name: 'issues_text_search' }
    );

    // Leaderboard — resolved issues sorted by volunteer
    await issues.createIndex({ status: 1, assignedToId: 1, resolvedAt: -1 });

    // ── citizens ─────────────────────────────────────────────────────────────
    const citizens = db.collection('citizens');
    await citizens.createIndex({ email: 1 }, { unique: true });

    // ── volunteers ───────────────────────────────────────────────────────────
    const volunteers = db.collection('volunteers');
    await volunteers.createIndex({ email: 1 }, { unique: true });
    await volunteers.createIndex({ approvalStatus: 1 }); // pending volunteer list

    // ── notifications ────────────────────────────────────────────────────────
    const notifications = db.collection('notifications');
    // Fetching unread notifications for a specific user — happens on every page load
    await notifications.createIndex({ targetUserId: 1, isRead: 1, createdAt: -1 });
    await notifications.createIndex({ targetRole: 1, targetType: 1, createdAt: -1 });

    // ── activity ─────────────────────────────────────────────────────────────
    const activity = db.collection('activity');
    await activity.createIndex({ userId: 1, createdAt: -1 });

  } catch (error) {
    // Log but don't crash the app — indexes are a performance concern, not correctness
    console.error('Failed to create MongoDB indexes:', error);
  }
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db     = client.db(dbName);

  await ensureIndexes(db);

  return { client, db };
}