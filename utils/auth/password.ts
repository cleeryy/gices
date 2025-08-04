import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateRandomPassword(length: number = 8): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// J'ai ce fichier et j'ai ces erreurs. Donne moi le fichier corrigé s'il te plaît merci!

// -- Migration des conseillers municipaux
// INSERT INTO council_members (id, "firstName", "lastName", position, login, "isActive", "createdAt", "updatedAt") VALUES
// (1, 'Eric', 'LANXADE', '1er', 'elan', False, '2025-07-30 09:30:17.165276', '2025-07-30 09:30:17.165284'),
// (2, 'Jean-François', 'ROUSSE', '2ème adjoint', 'jrou', True, '2025-07-30 09:30:17.165288', '2025-07-30 09:30:17.165288'),
// (3, 'Josselyne', 'CASTERAN', '3ème adjoint', 'jcas', False, '2025-07-30 09:30:17.165290', '2025-07-30 09:30:17.165290'),
// (4, 'Hélène', 'DELPECH', '4ème adjoint', 'hdel', True, '2025-07-30 09:30:17.165291', '2025-07-30 09:30:17.165292'),
// (5, 'Jean-Pierre', 'BERLIN', '5ème adjoint', 'jber', False, '2025-07-30 09:30:17.165293', '2025-07-30 09:30:17.165293'),
// (6, 'Françoise', 'MARTINEZ', '6ème adjoint', 'fmar', True, '2025-07-30 09:30:17.165294', '2025-07-30 09:30:17.165295'),
// (7, 'Régis', 'SANSOT', '7ème', 'rsan', False, '2025-07-30 09:30:17.165296', '2025-07-30 09:30:17.165296'),
// (8, 'Jean', 'CAUBOUE', 'Con…
// Erreur dans la requête (7): ERROR: duplicate key value violates unique constraint "council_members_login_key"
// DETAIL: Key (login)=() already exists.

// -- Migration des contacts entrants
// INSERT INTO contacts_in (id, name, "isActive", "createdAt", "updatedAt") VALUES
// (1, 'EL BAZ ADIL', True, '2025-07-30 09:30:17.180122', '2025-07-30 09:30:17.180127'),
// (2, 'ASSOCIATION DES MAIRES', True, '2025-07-30 09:30:17.180132', '2025-07-30 09:30:17.180132'),
// (3, 'SARL CETELEC A MORLAAS', True, '2025-07-30 09:30:17.180134', '2025-07-30 09:30:17.180134'),
// (4, 'NOTAIRES OURTAL / BOUYSSOU', True, '2025-07-30 09:30:17.180135', '2025-07-30 09:30:17.180135'),
// (5, 'DAS GEDI A LE MANS', True, '2025-07-30 09:30:17.180136', '2025-07-30 09:30:17.180136'),
// (6, 'MAIRIE DE PERPIGNAN', True, '2025-07-30 09:30:17.180137', '2025-07-30 09:30:17.180137'),
// (7, 'VINCENT THIERRY - GEOMETRE', True, '2025-07-30 09:30:17.180138', '2025-07-30 09:30:17.180139'),
// (8, 'TALHAOUI INES', True, '2025-07-30 09:30:17.180139', '2025-07-30 09:30:17.180140'),
// (9, 'CASTELLI-BAYZE MONIQUE', True, '2025-07-30 09:30:17.180142', '2025-07-30 09:30:17.180142'),
// (10, 'CNFPT A TOULOUSE', True, …
// Erreur dans la requête (7): ERROR: duplicate key value violates unique constraint "contacts_in_pkey"
// DETAIL: Key (id)=(1) already exists.

// -- Migration des courriers entrants
// -- Batch 1
// INSERT INTO mail_in (id, date, subject, "needsMayor", "needsDgs", "createdAt", "updatedAt") VALUES
// (1, '2012-04-16', 'DEMANDE LOCATION LOCAL ANCIEN POINT SNCF', False, False, '2025-07-30 09:30:17.585447', '2025-07-30 09:30:17.585448'),
// (2, '2012-04-16', 'CARTE SCOLAIRE / GROUPE TRAVAIL', False, False, '2025-07-30 09:30:17.585452', '2025-07-30 09:30:17.585452'),
// (3, '2012-04-16', 'INVITATION A LA PRESENTATION DU 24 AVRIL 2012', False, False, '2025-07-30 09:30:17.585454', '2025-07-30 09:30:17.585454'),
// (4, '2012-04-16', 'DEMANDE RENSEIGNEMENTS SUR OUVRAGES DIVERS', False, False, '2025-07-30 09:30:17.585455', '2025-07-30 09:30:17.585455'),
// (5, '2012-04-16', 'VENTE JOB A COMMUNE CONDOM/CONDIT.ACQUISITION', False, False, '2025-07-30 09:30:17.585456', '2025-07-30 09:30:17.585457'),
// (6, '2012-04-16', 'DECL.SINISTRE LABORDE/PELLERIN EHPAD', False, False, '2025-07-30 09:30:17.585457', '2025-07-30 09:30:17.585458'),
// (7, '2012-04-16', 'AFFICHAGE DECA…
// Erreur dans la requête (7): ERROR: duplicate key value violates unique constraint "mail_in_pkey"
// DETAIL: Key (id)=(1) already exists.

// -- Migration des relations

// -- Expéditeurs de courriers
// INSERT INTO mail_in_recipients ("mailInId", "contactId") VALUES
// (1, 1),
// (2, 2),
// (3, 2),
// (518, 2),
// (529, 2),
// (606, 2),
// (607, 2),
// (106, 2),
// (363, 2),
// (366, 2),
// (373, 2),
// (498, 2),
// (616, 2),
// (71, 2),
// (133, 2),
// (138, 2),
// (148, 2),
// (206, 2),
// (284, 2),
// (356, 2),
// (360, 2),
// (426, 2),
// (5, 2),
// (89, 2),
// (177, 2),
// (539, 2),
// (720, 2),
// (513, 2),
// (516, 2),
// (565, 2),
// (613, 2),
// (617, 2),
// (1, 2),
// (429, 2),
// (430, 2),
// (431, 2),
// (490, 2),
// (492, 2),
// (714, 2),
// (781, 2),
// (118, 2),
// (125, 2),
// (217, 2),
// (698, 2),
// (762, 2),
// (241, 2),
// (273, 2),
// (546, 2),
// (568, 2),
// (574, 2),
// (690, 2),
// (765, 2),
// (797, 2),
// (798, 2),
// (140, 2),
// (143, 2),
// (357, 2),
// (380, 2),
// (447, 2),
// (673, 2),
// (238, 2),
// (365, 2),
// (366, 2),
// (400, 2),
// (419, 2),
// (720, 2),
// (441, 2),
// (695, 2),
// (743, 2),
// (4, 3),
// (310, 3),
// (311, 3),
// (664, 3),
// (144, 3),
// (273, 3),
// (399, 3),
// (619, 3),
// (5, 4),
// (98, 4),
// (154, 4),
// (309, 4),
// (310, 4),
// (311, 4),
// (336, 4),
// (455, 4),
// (562, 4),
// (604, 4),
// (622, 4),
// (623, 4),
// (626, 4…
// Erreur dans la requête (7): ERROR: duplicate key value violates unique constraint "mail_in_recipients_pkey"
// DETAIL: Key ("mailInId", "contactId")=(366, 2) already exists.
