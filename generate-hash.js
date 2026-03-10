const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Mot de passe:', password);
  console.log('Hash COMPLET (60 caractères):', hash);
  console.log('Longueur du hash:', hash.length);
  return hash;
}

async function main() {
  console.log('=== GÉNÉRATION DES HASH ===');
  await generateHash('Bergersuivi');
  console.log('---');
  await generateHash('Mega2026');
  console.log('---');
  await generateHash('admin123');
}

main();