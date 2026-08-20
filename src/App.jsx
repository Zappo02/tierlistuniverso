import { useState, useRef } from "react";
import html2canvas from "html2canvas";

// ═══════════════════════════════════════════════════
// DATI — modifica qui squadre e leghe
// ═══════════════════════════════════════════════════

const LEAGUES = [
  { id: "seriea",    label: "Serie A",    flag: "🇮🇹" },
  { id: "serieb",    label: "Serie B",    flag: "🇮🇹" },
  { id: "premier",   label: "Premier",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "laliga",    label: "La Liga",    flag: "🇪🇸" },
  { id: "bundesliga",label: "Bundesliga", flag: "🇩🇪" },
  { id: "ligue1",    label: "Ligue 1",    flag: "🇫🇷" },
];

const TEAMS = {
  seriea: [
    { id:"sa1",  name:"Inter",      short:"INT", color:"#0a1f5c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/64px-FC_Internazionale_Milano_2021.svg.png" },
    { id:"sa2",  name:"Napoli",     short:"NAP", color:"#00a0de", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Napoli_2023.svg/64px-SSC_Napoli_2023.svg.png" },
    { id:"sa3",  name:"Juventus",   short:"JUV", color:"#555",    logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/64px-Juventus_FC_2017_logo.svg.png" },
    { id:"sa4",  name:"Milan",      short:"MIL", color:"#fb090b", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/64px-Logo_of_AC_Milan.svg.png" },
    { id:"sa5",  name:"Atalanta",   short:"ATA", color:"#1e3fa0", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Atalanta_BC_logo.svg/64px-Atalanta_BC_logo.svg.png" },
    { id:"sa6",  name:"Roma",       short:"ROM", color:"#8b1a1a", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/AS_Roma_nuovo_logo.png/64px-AS_Roma_nuovo_logo.png" },
    { id:"sa7",  name:"Lazio",      short:"LAZ", color:"#4a90d9", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/SS_Lazio_Badge_2017.svg/64px-SS_Lazio_Badge_2017.svg.png" },
    { id:"sa8",  name:"Fiorentina", short:"FIO", color:"#6a0dad", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/ACF_Fiorentina.svg/64px-ACF_Fiorentina.svg.png" },
    { id:"sa9",  name:"Bologna",    short:"BOL", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bologna_FC_1909_logo_%282024%29.svg/64px-Bologna_FC_1909_logo_%282024%29.svg.png" },
    { id:"sa10", name:"Torino",     short:"TOR", color:"#8b2500", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Logo_Torino_FC.svg/64px-Logo_Torino_FC.svg.png" },
    { id:"sa11", name:"Udinese",    short:"UDI", color:"#2a2a4e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Udinese_Calcio_logo.svg/64px-Udinese_Calcio_logo.svg.png" },
    { id:"sa12", name:"Genoa",      short:"GEN", color:"#8b0000", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Genoa_CFC.svg/64px-Genoa_CFC.svg.png" },
    { id:"sa13", name:"Cagliari",   short:"CAG", color:"#b22222", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Cagliari_Calcio_logo.svg/64px-Cagliari_Calcio_logo.svg.png" },
    { id:"sa14", name:"Como",       short:"COM", color:"#1f4e79", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Como_1907.svg/64px-Como_1907.svg.png" },
    { id:"sa15", name:"Parma",      short:"PAR", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Parma_Calcio_1913.svg/64px-Parma_Calcio_1913.svg.png" },
    { id:"sa16", name:"Verona",     short:"VER", color:"#003da5", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Hellas_Verona_FC_logo.svg/64px-Hellas_Verona_FC_logo.svg.png" },
    { id:"sa17", name:"Empoli",     short:"EMP", color:"#004b87", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Empoli.svg/64px-FC_Empoli.svg.png" },
    { id:"sa18", name:"Lecce",      short:"LEC", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/US_Lecce.svg/64px-US_Lecce.svg.png" },
    { id:"sa19", name:"Venezia",    short:"VEN", color:"#f36f21", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/FC_Venezia.svg/64px-FC_Venezia.svg.png" },
    { id:"sa20", name:"Monza",      short:"MON", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/AC_Monza.svg/64px-AC_Monza.svg.png" },
  ],
  serieb: [
    { id:"sb1",  name:"Spezia",      short:"SPE", color:"#1a1a2e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Spezia_Calcio_logo.svg/64px-Spezia_Calcio_logo.svg.png" },
    { id:"sb2",  name:"Pisa",        short:"PIS", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/AC_Pisa_1909_logo.svg/64px-AC_Pisa_1909_logo.svg.png" },
    { id:"sb3",  name:"Sassuolo",    short:"SAS", color:"#00622b", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/US_Sassuolo_Calcio_logo.svg/64px-US_Sassuolo_Calcio_logo.svg.png" },
    { id:"sb4",  name:"Cremonese",   short:"CRE", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/US_Cremonese.svg/64px-US_Cremonese.svg.png" },
    { id:"sb5",  name:"Bari",        short:"BAR", color:"#cc0000", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/SSC_Bari_logo.svg/64px-SSC_Bari_logo.svg.png" },
    { id:"sb6",  name:"Catanzaro",   short:"CAT", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Catanzaro_logo.svg/64px-Catanzaro_logo.svg.png" },
    { id:"sb7",  name:"Cesena",      short:"CES", color:"#555",    logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Cesena_FC.svg/64px-Cesena_FC.svg.png" },
    { id:"sb8",  name:"Mantova",     short:"MAN", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Mantova_1911.svg/64px-Mantova_1911.svg.png" },
    { id:"sb9",  name:"Palermo",     short:"PAL", color:"#f5a623", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/US_Palermo_logo.svg/64px-US_Palermo_logo.svg.png" },
    { id:"sb10", name:"Frosinone",   short:"FRO", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Frosinone_Calcio.svg/64px-Frosinone_Calcio.svg.png" },
    { id:"sb11", name:"Modena",      short:"MOD", color:"#f5a623", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Modena_FC_2018.svg/64px-Modena_FC_2018.svg.png" },
    { id:"sb12", name:"Salernitana", short:"SAL", color:"#8b1a1a", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/US_Salernitana_1919.svg/64px-US_Salernitana_1919.svg.png" },
    { id:"sb13", name:"Sampdoria",   short:"SAM", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/UC_Sampdoria.svg/64px-UC_Sampdoria.svg.png" },
    { id:"sb14", name:"Cittadella",  short:"CIT", color:"#8b1a1a", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cittadella.svg/64px-Cittadella.svg.png" },
    { id:"sb15", name:"Brescia",     short:"BRE", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Brescia_Calcio_Logo.svg/64px-Brescia_Calcio_Logo.svg.png" },
    { id:"sb16", name:"Carrarese",   short:"CAR", color:"#2a2a4e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Carrarese_Calcio_1908.svg/64px-Carrarese_Calcio_1908.svg.png" },
    { id:"sb17", name:"Juve Stabia", short:"JST", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/SS_Juve_Stabia.svg/64px-SS_Juve_Stabia.svg.png" },
    { id:"sb18", name:"Cosenza",     short:"COS", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Cosenza_Calcio.svg/64px-Cosenza_Calcio.svg.png" },
    { id:"sb19", name:"Reggiana",    short:"REG", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/AC_Reggiana_1919.svg/64px-AC_Reggiana_1919.svg.png" },
    { id:"sb20", name:"Sudtirol",    short:"SUD", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/FC_S%C3%BCdtirol_logo.svg/64px-FC_S%C3%BCdtirol_logo.svg.png" },
  ],
  premier: [
    { id:"pl1",  name:"Man City",    short:"MCI", color:"#6caddf", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/64px-Manchester_City_FC_badge.svg.png" },
    { id:"pl2",  name:"Arsenal",     short:"ARS", color:"#ef0107", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/64px-Arsenal_FC.svg.png" },
    { id:"pl3",  name:"Liverpool",   short:"LIV", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/64px-Liverpool_FC.svg.png" },
    { id:"pl4",  name:"Chelsea",     short:"CHE", color:"#034694", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/64px-Chelsea_FC.svg.png" },
    { id:"pl5",  name:"Man Utd",     short:"MUN", color:"#da291c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/64px-Manchester_United_FC_crest.svg.png" },
    { id:"pl6",  name:"Tottenham",   short:"TOT", color:"#132257", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/64px-Tottenham_Hotspur.svg.png" },
    { id:"pl7",  name:"Newcastle",   short:"NEW", color:"#555",    logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/64px-Newcastle_United_Logo.svg.png" },
    { id:"pl8",  name:"Aston Villa", short:"AVL", color:"#95bfe5", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Aston_Villa_FC_new_crest.svg/64px-Aston_Villa_FC_new_crest.svg.png" },
    { id:"pl9",  name:"Brighton",    short:"BHA", color:"#0057b8", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/64px-Brighton_%26_Hove_Albion_logo.svg.png" },
    { id:"pl10", name:"West Ham",    short:"WHU", color:"#7a263a", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/64px-West_Ham_United_FC_logo.svg.png" },
    { id:"pl11", name:"Everton",     short:"EVE", color:"#003399", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/64px-Everton_FC_logo.svg.png" },
    { id:"pl12", name:"Fulham",      short:"FUL", color:"#cc0000", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/64px-Fulham_FC_%28shield%29.svg.png" },
    { id:"pl13", name:"Wolves",      short:"WOL", color:"#fdb913", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/64px-Wolverhampton_Wanderers.svg.png" },
    { id:"pl14", name:"Brentford",   short:"BRE", color:"#e30613", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/64px-Brentford_FC_crest.svg.png" },
    { id:"pl15", name:"Crystal P.",  short:"CRY", color:"#1b458f", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Crystal_Palace_FC_logo_%282022%29.svg/64px-Crystal_Palace_FC_logo_%282022%29.svg.png" },
    { id:"pl16", name:"Nottm F.",    short:"NFO", color:"#dd0000", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_FC_logo.svg/64px-Nottingham_Forest_FC_logo.svg.png" },
    { id:"pl17", name:"Bournemouth", short:"BOU", color:"#da291c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/64px-AFC_Bournemouth_%282013%29.svg.png" },
    { id:"pl18", name:"Leicester",   short:"LEI", color:"#003090", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/64px-Leicester_City_crest.svg.png" },
    { id:"pl19", name:"Ipswich",     short:"IPS", color:"#003090", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Ipswich_Town.svg/64px-Ipswich_Town.svg.png" },
    { id:"pl20", name:"Southampton", short:"SOU", color:"#d71920", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/FC_Southampton.svg/64px-FC_Southampton.svg.png" },
  ],
  laliga: [
    { id:"ll1",  name:"Real Madrid",  short:"RMA", color:"#c8a400", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/64px-Real_Madrid_CF.svg.png" },
    { id:"ll2",  name:"Barcelona",    short:"BAR", color:"#a50044", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/64px-FC_Barcelona_%28crest%29.svg.png" },
    { id:"ll3",  name:"Atletico",     short:"ATM", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/64px-Atletico_Madrid_2017_logo.svg.png" },
    { id:"ll4",  name:"Athletic",     short:"ATH", color:"#ee2523", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_de_Bilbao_logo.svg/64px-Club_Athletic_de_Bilbao_logo.svg.png" },
    { id:"ll5",  name:"Villarreal",   short:"VIL", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Villarreal_CF_logo-en.svg/64px-Villarreal_CF_logo-en.svg.png" },
    { id:"ll6",  name:"Sevilla",      short:"SEV", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/64px-Sevilla_FC_logo.svg.png" },
    { id:"ll7",  name:"Real Betis",   short:"BET", color:"#00954c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/64px-Real_betis_logo.svg.png" },
    { id:"ll8",  name:"Real Sociedad",short:"RSO", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/64px-Real_Sociedad_logo.svg.png" },
    { id:"ll9",  name:"Osasuna",      short:"OSA", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/73/CA_Osasuna.svg/64px-CA_Osasuna.svg.png" },
    { id:"ll10", name:"Celta Vigo",   short:"CEL", color:"#75aadb", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/RC_Celta_de_Vigo_logo.svg/64px-RC_Celta_de_Vigo_logo.svg.png" },
    { id:"ll11", name:"Getafe",       short:"GET", color:"#005faa", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Getafe_CF.svg/64px-Getafe_CF.svg.png" },
    { id:"ll12", name:"Las Palmas",   short:"LPA", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/75/UD_Las_Palmas_logo.svg/64px-UD_Las_Palmas_logo.svg.png" },
    { id:"ll13", name:"Rayo",         short:"RAY", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Rayo_Vallecano_logo.svg/64px-Rayo_Vallecano_logo.svg.png" },
    { id:"ll14", name:"Mallorca",     short:"MAL", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/ab/RCD_Mallorca_logo.svg/64px-RCD_Mallorca_logo.svg.png" },
    { id:"ll15", name:"Girona",       short:"GIR", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Girona_FC_logo.svg/64px-Girona_FC_logo.svg.png" },
    { id:"ll16", name:"Deportivo",    short:"DEP", color:"#1a6db5", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/RC_Deportivo.svg/64px-RC_Deportivo.svg.png" },
    { id:"ll17", name:"Leganes",      short:"LEG", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/1/16/CD_Legan%C3%A9s_logo.svg/64px-CD_Legan%C3%A9s_logo.svg.png" },
    { id:"ll18", name:"Espanyol",     short:"ESP", color:"#005faa", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/76/RCD_Espanyol_Logo_%282021%29.svg/64px-RCD_Espanyol_Logo_%282021%29.svg.png" },
    { id:"ll19", name:"Valencia",     short:"VAL", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/64px-Valenciacf.svg.png" },
    { id:"ll20", name:"Valladolid",   short:"VLD", color:"#6a0dad", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b2/Real_Valladolid_CF_logo.svg/64px-Real_Valladolid_CF_logo.svg.png" },
  ],
  bundesliga: [
    { id:"bl1",  name:"Bayern",       short:"BAY", color:"#dc052d", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/64px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png" },
    { id:"bl2",  name:"Dortmund",     short:"BVB", color:"#c8a400", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/64px-Borussia_Dortmund_logo.svg.png" },
    { id:"bl3",  name:"Leverkusen",   short:"B04", color:"#e32221", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/64px-Bayer_04_Leverkusen_logo.svg.png" },
    { id:"bl4",  name:"RB Leipzig",   short:"RBL", color:"#dd0741", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/64px-RB_Leipzig_2014_logo.svg.png" },
    { id:"bl5",  name:"Frankfurt",    short:"SGE", color:"#e1000f", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/64px-Eintracht_Frankfurt_Logo.svg.png" },
    { id:"bl6",  name:"Wolfsburg",    short:"WOB", color:"#65b32e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/64px-Logo-VfL-Wolfsburg.svg.png" },
    { id:"bl7",  name:"M'gladbach",   short:"BMG", color:"#555",    logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Borussia_M%C3%B6nchengladbach_logo.svg/64px-Borussia_M%C3%B6nchengladbach_logo.svg.png" },
    { id:"bl8",  name:"Union Berlin", short:"FCU", color:"#eb1923", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/1._FC_Union_Berlin_Logo.svg/64px-1._FC_Union_Berlin_Logo.svg.png" },
    { id:"bl9",  name:"Freiburg",     short:"SCF", color:"#e1000f", logo:"https://upload.wikimedia.org/wikipedia/de/thumb/f/f6/Sport-Club_Freiburg_2015.svg/64px-Sport-Club_Freiburg_2015.svg.png" },
    { id:"bl10", name:"Stuttgart",    short:"VFB", color:"#e32221", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/VfB_Stuttgart_1893_Logo.svg/64px-VfB_Stuttgart_1893_Logo.svg.png" },
    { id:"bl11", name:"Augsburg",     short:"FCA", color:"#007a3e", logo:"https://upload.wikimedia.org/wikipedia/de/thumb/b/b5/FC_Augsburg_logo.svg/64px-FC_Augsburg_logo.svg.png" },
    { id:"bl12", name:"Mainz",        short:"M05", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logo_Mainz_05.svg/64px-Logo_Mainz_05.svg.png" },
    { id:"bl13", name:"Hoffenheim",   short:"TSG", color:"#1763a5", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_TSG_Hoffenheim.svg/64px-Logo_TSG_Hoffenheim.svg.png" },
    { id:"bl14", name:"Werder",       short:"SVW", color:"#1d9053", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/64px-SV-Werder-Bremen-Logo.svg.png" },
    { id:"bl15", name:"Bochum",       short:"VfL", color:"#005faa", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/VfL_Bochum_logo.svg/64px-VfL_Bochum_logo.svg.png" },
    { id:"bl16", name:"Heidenheim",   short:"FCH", color:"#e32221", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/1._FC_Heidenheim_1846_Logo.svg/64px-1._FC_Heidenheim_1846_Logo.svg.png" },
    { id:"bl17", name:"St. Pauli",    short:"STP", color:"#8b2500", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/FC_St_Pauli_logo_since_2018.svg/64px-FC_St_Pauli_logo_since_2018.svg.png" },
    { id:"bl18", name:"Holstein Kiel",short:"KSV", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Holstein_Kiel_Logo.svg/64px-Holstein_Kiel_Logo.svg.png" },
  ],
  ligue1: [
    { id:"l1a",  name:"PSG",          short:"PSG", color:"#004170", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/64px-Paris_Saint-Germain_F.C..svg.png" },
    { id:"l1b",  name:"Monaco",       short:"ASM", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/AS_Monaco_FC.svg/64px-AS_Monaco_FC.svg.png" },
    { id:"l1c",  name:"Marseille",    short:"OM",  color:"#009fda", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/64px-Olympique_Marseille_logo.svg.png" },
    { id:"l1d",  name:"Lyon",         short:"OL",  color:"#002e6d", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Olympique_Lyonnais_%28logo%29.svg/64px-Olympique_Lyonnais_%28logo%29.svg.png" },
    { id:"l1e",  name:"Lille",        short:"LIL", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/LOSC_Lille_logo.svg/64px-LOSC_Lille_logo.svg.png" },
    { id:"l1f",  name:"Nice",         short:"NIC", color:"#e32221", logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/OGC_Nice_logo.svg/64px-OGC_Nice_logo.svg.png" },
    { id:"l1g",  name:"Rennes",       short:"REN", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Stade_Rennais_FC_logo.svg/64px-Stade_Rennais_FC_logo.svg.png" },
    { id:"l1h",  name:"Lens",         short:"LEN", color:"#c8a400", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/42/RC_Lens_logo.svg/64px-RC_Lens_logo.svg.png" },
    { id:"l1i",  name:"Strasbourg",   short:"STR", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/90/RC_Strasbourg_Alsace.svg/64px-RC_Strasbourg_Alsace.svg.png" },
    { id:"l1j",  name:"Brest",        short:"BRE", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/1/11/Stade_Brestois_29_logo.svg/64px-Stade_Brestois_29_logo.svg.png" },
    { id:"l1k",  name:"Nantes",       short:"NAN", color:"#b8960c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/FC_Nantes_%28logo%29.svg/64px-FC_Nantes_%28logo%29.svg.png" },
    { id:"l1l",  name:"Montpellier",  short:"MHO", color:"#f5820f", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Montpellier_H%C3%A9rault_Sport_Club.svg/64px-Montpellier_H%C3%A9rault_Sport_Club.svg.png" },
    { id:"l1m",  name:"Toulouse",     short:"TLS", color:"#6a0dad", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Toulouse_FC_2018.svg/64px-Toulouse_FC_2018.svg.png" },
    { id:"l1n",  name:"Reims",        short:"SDR", color:"#c8102e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/Stade_de_Reims_logo.svg/64px-Stade_de_Reims_logo.svg.png" },
    { id:"l1o",  name:"Le Havre",     short:"HAC", color:"#1a6db5", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/52/HAC_logo.svg/64px-HAC_logo.svg.png" },
    { id:"l1p",  name:"Angers",       short:"ANG", color:"#2a2a4e", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Angers_SCO.svg/64px-Angers_SCO.svg.png" },
    { id:"l1q",  name:"Saint-Etienne",short:"ASSE",color:"#006b3c", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/AS_Saint-%C3%89tienne_logo.svg/64px-AS_Saint-%C3%89tienne_logo.svg.png" },
    { id:"l1r",  name:"Auxerre",      short:"AJA", color:"#003d99", logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/AJ_Auxerre_logo.svg/64px-AJ_Auxerre_logo.svg.png" },
  ],
};

// ═══════════════════════════════════════════════════
// FASCE — modifica qui le label/colori
// ═══════════════════════════════════════════════════

const TIER_TIERS = [
  { id:"elite",     label:"ELITE",         color:"#c9a84c", bg:"#1a1200", desc:"Scudetto / Top 2" },
  { id:"champions", label:"CHAMPIONS",     color:"#4a90d9", bg:"#00112a", desc:"Top 4 UCL" },
  { id:"europa",    label:"EUROPA",        color:"#3dbb6e", bg:"#001a0e", desc:"Europa / Conference" },
  { id:"salvezza",  label:"SALVEZZA",      color:"#e07b20", bg:"#1a0d00", desc:"Mid-table sicuro" },
  { id:"retro",     label:"RETRO",         color:"#c0392b", bg:"#1a0000", desc:"Zona rossa" },
];

const MARKET_TIERS = [
  { id:"v10", label:"10",  color:"#c9a84c", bg:"#1a1200", desc:"Capolavoro" },
  { id:"v9",  label:"9",   color:"#3dbb6e", bg:"#001a0e", desc:"Eccellente" },
  { id:"v8",  label:"8",   color:"#4a90d9", bg:"#00112a", desc:"Molto bene" },
  { id:"v7",  label:"7",   color:"#7b68ee", bg:"#0a0022", desc:"Buono" },
  { id:"v6",  label:"6",   color:"#e07b20", bg:"#1a0d00", desc:"Sufficiente" },
  { id:"v5",  label:"5",   color:"#c8a000", bg:"#1a1400", desc:"Insufficiente" },
  { id:"v04", label:"0-4", color:"#c0392b", bg:"#1a0000", desc:"Disastroso" },
];

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════

function empty(tiers) {
  const o = {};
  tiers.forEach(t => { o[t.id] = []; });
  return o;
}

function Logo({ team }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return <div style={{ width:34,height:34,borderRadius:"50%",background:team.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff" }}>{team.short}</div>;
  return <img src={team.logo} alt={team.name} style={{ width:34,height:34,objectFit:"contain" }} onError={() => setErr(true)} />;
}

export default function App() {
  const [mode, setMode]     = useState("tier");
  const [league, setLeague] = useState("seriea");
  const [pl, setPl]         = useState({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
  const [pools, setPools]   = useState({ tier: TEAMS.seriea.map(t=>t.id), market: TEAMS.seriea.map(t=>t.id) });
  const [selected, setSel]  = useState(null);
  const [dragging, setDrag] = useState(null);
  const [modal, setModal]   = useState(null);
  const boardRef            = useRef(null);

  const TIERS    = mode === "tier" ? TIER_TIERS : MARKET_TIERS;
  const placements = pl[mode];
  const pool       = pools[mode];
  const teams      = TEAMS[league] || [];
  const getTeam    = id => teams.find(t => t.id === id);

  function changeLeague(lg) {
    const ids = (TEAMS[lg] || []).map(t => t.id);
    setLeague(lg);
    setPl({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
    setPools({ tier: ids, market: ids });
    setSel(null);
  }

  function move(teamId, toTier) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = { ...m[mode] };
      TIERS.forEach(t => { tiers[t.id] = (tiers[t.id]||[]).filter(id => id !== teamId); });
      tiers[toTier] = [...(tiers[toTier]||[]), teamId];
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: prev[mode].filter(id => id !== teamId) }));
  }

  function toPool(teamId) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = { ...m[mode] };
      TIERS.forEach(t => { tiers[t.id] = (tiers[t.id]||[]).filter(id => id !== teamId); });
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: [...prev[mode], teamId] }));
    setSel(null);
  }

  function randomize() {
    const ids = [...teams.map(t=>t.id)].sort(()=>Math.random()-.5);
    const n = TIERS.length;
    const sizes = Array(n).fill(Math.floor(ids.length/n));
    let rem = ids.length % n;
    for (let i=0;i<rem;i++) sizes[i]++;
    const tiers = {}; let i=0;
    TIERS.forEach((t,ti) => { tiers[t.id]=ids.slice(i,i+sizes[ti]); i+=sizes[ti]; });
    setPl(prev => ({ ...prev, [mode]: tiers }));
    setPools(prev => ({ ...prev, [mode]: [] }));
    setSel(null);
  }

  function resetAll() {
    setPl(prev => ({ ...prev, [mode]: empty(TIERS) }));
    setPools(prev => ({ ...prev, [mode]: teams.map(t=>t.id) }));
    setSel(null);
  }

  async function saveImage() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor:"#0a0a12", scale:2, useCORS:true, allowTaint:true });
    const a = document.createElement("a");
    const lg = LEAGUES.find(l=>l.id===league)?.label||league;
    a.download = (mode==="tier"?"TierList":"Mercato")+"-"+lg+".png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function shareX() {
    const lg = LEAGUES.find(l=>l.id===league)?.label||"";
    const ml = mode==="tier" ? "Tier List" : "Voti Mercato";
    const txt = encodeURIComponent(`La mia ${ml} ${lg} 2025/26! ⚽ #SerieA #TierList @universo_calcio`);
    window.open("https://twitter.com/intent/tweet?text="+txt,"_blank");
  }

  const placed = Object.values(placements).flat().length;

  // Card component
  const Card = ({ teamId, fromTier, inModal }) => {
    const t = getTeam(teamId);
    if (!t) return null;
    const isSel = selected?.teamId === teamId;
    const tier = fromTier ? TIERS.find(x=>x.id===fromTier) : null;
    return (
      <div
        draggable={!inModal}
        onDragStart={e => { e.stopPropagation(); setDrag({ teamId, fromTier }); e.dataTransfer.effectAllowed="move"; }}
        onClick={e => {
          e.stopPropagation();
          if (inModal) { move(teamId, modal); setModal(null); return; }
          if (isSel) { setSel(null); return; }
          setSel({ teamId, fromTier });
        }}
        style={{
          width:72, height:84, flexShrink:0,
          background: isSel ? "#ffffff18" : "#151525",
          border: isSel ? `2px solid ${tier?.color||"#c9a84c"}` : "2px solid #252540",
          boxShadow: isSel ? `0 0 10px ${tier?.color||"#c9a84c"}88` : "none",
          borderRadius:8, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          cursor: inModal ? "pointer" : "grab",
          userSelect:"none", position:"relative", transition:"border .15s",
        }}
      >
        <Logo team={t} />
        <div style={{ fontSize:9,marginTop:4,color:"#ccc",textAlign:"center",lineHeight:1.2,maxWidth:68,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 2px" }}>{t.name}</div>
        {fromTier && (
          <button onClick={e=>{e.stopPropagation();toPool(teamId);}}
            style={{ position:"absolute",top:2,right:2,background:"none",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer",lineHeight:1,padding:1 }}>×</button>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", color:"#f0f0f8", fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:60 }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0a0a12,#131325)", borderBottom:"2px solid #c9a84c33", padding:"16px 16px 14px", textAlign:"center" }}>
        <div style={{ fontSize:10,letterSpacing:6,color:"#c9a84c",textTransform:"uppercase",marginBottom:3 }}>Universosportivo.com</div>
        <h1 style={{ margin:0, fontSize:"clamp(17px,3.5vw,28px)", fontWeight:900, letterSpacing:-1, color:"#fff" }}>
          {mode==="tier" ? "Tier List" : "Voti Mercato"} <span style={{ color:"#c9a84c" }}>{LEAGUES.find(l=>l.id===league)?.flag} {LEAGUES.find(l=>l.id===league)?.label}</span> 2025/26
        </h1>
        <div style={{ fontSize:11,color:"#888",marginTop:3 }}>{placed} / {teams.length} squadre posizionate</div>

        {/* MODE */}
        <div style={{ display:"flex",justifyContent:"center",marginTop:10,background:"#13131f",borderRadius:8,padding:3,width:"fit-content",margin:"10px auto 0" }}>
          {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setSel(null);}}
              style={{ padding:"6px 16px",borderRadius:6,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",background:mode===m?"#c9a84c":"transparent",color:mode===m?"#000":"#888",transition:"all .2s" }}>{lbl}</button>
          ))}
        </div>

        {/* LEAGUES */}
        <div style={{ display:"flex",justifyContent:"center",gap:6,marginTop:10,flexWrap:"wrap" }}>
          {LEAGUES.map(lg=>(
            <button key={lg.id} onClick={()=>changeLeague(lg.id)}
              style={{ padding:"4px 12px",borderRadius:20,border:`1px solid ${league===lg.id?"#c9a84c":"#333"}`,background:league===lg.id?"#c9a84c18":"transparent",color:league===lg.id?"#c9a84c":"#888",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s" }}>
              {lg.flag} {lg.label}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap" }}>
          {[["#c9a84c","#1a120033","🎲 Riempi a caso",randomize],["#888","#1a1a1a33","↺ Svuota tutto",resetAll],["#3dbb6e","#001a0e33","⬇ Salva PNG",saveImage],["#1da1f2","#00112a33","𝕏 Condividi",shareX]].map(([c,bg,lbl,fn])=>(
            <button key={lbl} onClick={fn} style={{ background:bg,border:`1px solid ${c}66`,color:c,padding:"6px 13px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer" }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ textAlign:"center",fontSize:10,color:"#555",padding:"7px 16px 0" }}>
        Trascina nelle fasce · Mobile: tocca squadra poi fascia · × per rimuovere
      </div>

      {/* BOARD */}
      <div ref={boardRef} style={{ maxWidth:800,margin:"12px auto 0",padding:"0 8px" }}>
        <div style={{ background:"#0d0d1a",borderRadius:12,overflow:"hidden",border:"1px solid #222" }}>
          {TIERS.map(tier => {
            const tierTeams = placements[tier.id] || [];
            return (
              <div key={tier.id} style={{ display:"flex",borderBottom:"1px solid #1a1a2e",minHeight:96 }}>
                {/* Label */}
                <div style={{ width:90,minWidth:90,background:tier.bg,borderRight:`3px solid ${tier.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 4px" }}>
                  <div style={{ fontSize:tier.label.length>3?10:16,fontWeight:900,color:tier.color,textAlign:"center",lineHeight:1.2 }}>{tier.label}</div>
                  <div style={{ fontSize:8,color:"#555",marginTop:2,textAlign:"center",lineHeight:1.3 }}>{tier.desc}</div>
                </div>
                {/* Teams */}
                <div
                  style={{ flex:1,display:"flex",flexWrap:"wrap",alignItems:"center",padding:"8px 6px",gap:6,background:"#0d0d1a" }}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();if(dragging){move(dragging.teamId,tier.id);setDrag(null);}}}
                  onClick={()=>{if(selected){if(selected.fromTier)toPool(selected.teamId);move(selected.teamId,tier.id);setSel(null);}}}
                >
                  {tierTeams.map(tid=><Card key={tid} teamId={tid} fromTier={tier.id} />)}
                  {pool.length > 0 && (
                    <div onClick={e=>{e.stopPropagation();setModal(tier.id);}}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=tier.color;e.currentTarget.style.color=tier.color;}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.color="#444";}}
                      style={{ width:72,height:84,border:"2px dashed #333",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#444",fontSize:24,flexShrink:0,transition:"all .15s" }}>+</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* POOL */}
        <div style={{ marginTop:12,background:"#0d0d1a",borderRadius:12,border:"1px solid #222",padding:12 }}>
          <div style={{ fontSize:10,letterSpacing:3,color:"#555",textTransform:"uppercase",marginBottom:10 }}>Squadre da posizionare</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,minHeight:40 }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();if(dragging?.fromTier){toPool(dragging.teamId);setDrag(null);}}}>
            {pool.length===0
              ? <div style={{ color:"#333",fontSize:12,alignSelf:"center" }}>Tutte le squadre posizionate ✔</div>
              : pool.map(tid=><Card key={tid} teamId={tid} fromTier={null} />)
            }
          </div>
        </div>

        <div style={{ textAlign:"center",marginTop:12,fontSize:10,color:"#333" }}>
          Creato con ❤️ da <span style={{ color:"#c9a84c" }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div onClick={()=>setModal(null)} style={{ position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f",border:"1px solid #333",borderRadius:14,padding:20,maxWidth:400,width:"90%",maxHeight:"80vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <span style={{ fontWeight:700,fontSize:14 }}>Scegli una squadra</span>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",color:"#888",fontSize:18,cursor:"pointer" }}>×</button>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {pool.map(tid=><Card key={tid} teamId={tid} fromTier={null} inModal />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
