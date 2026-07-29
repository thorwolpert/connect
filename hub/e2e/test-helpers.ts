import fs from 'fs'
import path from 'path'
import YAML from 'yaml'

/**
 * Retrieves the username and password for a specified test account from platform/test-data/user.yml
 */
export function getTestCredentials(username: string) {
  const ymlPath = path.resolve(process.cwd(), 'test-data/user.yml')
  if (!fs.existsSync(ymlPath)) {
    throw new Error(`[Test Helper] Credentials file does not exist at: ${ymlPath}`)
  }

  const fileContent = fs.readFileSync(ymlPath, 'utf8')

  try {
    const data = YAML.parse(fileContent)
    if (data && Array.isArray(data.users)) {
      for (const item of data.users) {
        // In the flow format, each item might be wrapped as { user: { name: '...', password: '...' } }
        const u = item.user || item
        if (u && u.name === username) {
          return { username: u.name, password: u.password }
        }
      }
    }
  } catch {
    // Fall back to regex scan if structure has duplicate keys / invalid flow mix
  }

  // Robust line-by-line regex fallback
  const lines = fileContent.split('\n')
  let currentName = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const nameMatch = line.match(/name:\s*["']([^"']+)["']/)
    if (nameMatch) {
      currentName = nameMatch[1]
    }
    const passwordMatch = line.match(/password:\s*["']([^"']+)["']/)
    if (passwordMatch && currentName === username) {
      return { username, password: passwordMatch[1] }
    }
  }

  throw new Error(`[Test Helper] Credentials for "${username}" not found in user.yml`)
}
