const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')

// Load .env.local or .env if present
const candidates = [path.resolve(process.cwd(), '.env.local'), path.resolve(process.cwd(), '.env')]
for (const p of candidates) {
  try { dotenv.config({ path: p }) } catch (e) {}
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/'
  const dbName = process.env.MONGODB_DB || 'majorproject'
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('Usage: node scripts/set-password.js user@example.com NewPassword123')
    process.exit(1)
  }

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const users = db.collection('users')

    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.error('User not found for', email)
      process.exitCode = 2
      return
    }

    const hashed = bcrypt.hashSync(newPassword, 10)
    const res = await users.updateOne({ _id: user._id }, { $set: { password: hashed } })
    if (res.modifiedCount === 1) {
      console.log('Password updated for', email)
    } else {
      console.error('Failed to update password. modifiedCount=', res.modifiedCount)
      process.exitCode = 3
    }
  } catch (err) {
    console.error('Error:', err)
    process.exitCode = 4
  } finally {
    await client.close()
  }
}

main()
