// src/utils/crypto.js
const secret = import.meta.env.VITE_ENCRYPTION_KEY

async function getKey() {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'PBKDF2' }, false, ['deriveKey']
    )
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode('murvbudget'), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    )
}

export async function encryptData(data) {
    if (!secret) return null
    const key = await getKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(JSON.stringify(data))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)))
}

export async function decryptData(blob) {
    if (!secret) throw new Error('No encryption key found')
    const key = await getKey()
    const bytes = Uint8Array.from(atob(blob), c => c.charCodeAt(0))
    const iv = bytes.slice(0, 12)
    const data = bytes.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return JSON.parse(new TextDecoder().decode(decrypted))
}