export interface GroupTeams {
  code: string;
  teams: string[];
}

export const WORLD_CUP_GROUPS: GroupTeams[] = [
  { code: "A", teams: ["MEX", "RSA", "KOR", "CZE"] },
  { code: "B", teams: ["CAN", "BIH", "QAT", "SUI"] },
  { code: "C", teams: ["BRA", "MAR", "HAI", "SCO"] },
  { code: "D", teams: ["USA", "PAR", "AUS", "TUR"] },
  { code: "E", teams: ["GER", "CUW", "CIV", "ECU"] },
  { code: "F", teams: ["NED", "JPN", "SWE", "TUN"] },
  { code: "G", teams: ["BEL", "EGY", "IRN", "NZL"] },
  { code: "H", teams: ["ESP", "CPV", "KSA", "URU"] },
  { code: "I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  { code: "J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  { code: "K", teams: ["POR", "COD", "UZB", "COL"] },
  { code: "L", teams: ["ENG", "CRO", "GHA", "PAN"] },
];

export const TEAM_NAMES: Record<string, string> = {
  MEX: "México", RSA: "Sudáfrica", KOR: "Corea del Sur", CZE: "Rep. Checa",
  CAN: "Canadá", BIH: "Bosnia", QAT: "Qatar", SUI: "Suiza",
  BRA: "Brasil", MAR: "Marruecos", HAI: "Haití", SCO: "Escocia",
  USA: "EE.UU.", PAR: "Paraguay", AUS: "Australia", TUR: "Turquía",
  GER: "Alemania", CUW: "Curazao", CIV: "Costa de Marfil", ECU: "Ecuador",
  NED: "Países Bajos", JPN: "Japón", SWE: "Suecia", TUN: "Túnez",
  BEL: "Bélgica", EGY: "Egipto", IRN: "Irán", NZL: "Nueva Zelanda",
  ESP: "España", CPV: "Cabo Verde", KSA: "Arabia Saudí", URU: "Uruguay",
  FRA: "Francia", SEN: "Senegal", IRQ: "Irak", NOR: "Noruega",
  ARG: "Argentina", ALG: "Argelia", AUT: "Austria", JOR: "Jordania",
  POR: "Portugal", COD: "RD Congo", UZB: "Uzbekistán", COL: "Colombia",
  ENG: "Inglaterra", CRO: "Croacia", GHA: "Ghana", PAN: "Panamá",
};

/** Abbreviated names for compact UI elements (chips, bracket cells) */
export const TEAM_SHORT: Record<string, string> = {
  MEX: "MEX", RSA: "RSA", KOR: "KOR", CZE: "CZE",
  CAN: "CAN", BIH: "BIH", QAT: "QAT", SUI: "SUI",
  BRA: "BRA", MAR: "MAR", HAI: "HAI", SCO: "SCO",
  USA: "USA", PAR: "PAR", AUS: "AUS", TUR: "TUR",
  GER: "GER", CUW: "CUW", CIV: "CIV", ECU: "ECU",
  NED: "NED", JPN: "JPN", SWE: "SWE", TUN: "TUN",
  BEL: "BEL", EGY: "EGY", IRN: "IRN", NZL: "NZL",
  ESP: "ESP", CPV: "CPV", KSA: "KSA", URU: "URU",
  FRA: "FRA", SEN: "SEN", IRQ: "IRQ", NOR: "NOR",
  ARG: "ARG", ALG: "ALG", AUT: "AUT", JOR: "JOR",
  POR: "POR", COD: "COD", UZB: "UZB", COL: "COL",
  ENG: "ENG", CRO: "CRO", GHA: "GHA", PAN: "PAN",
};
