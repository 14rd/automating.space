#!/usr/bin/env node
/**
 * build-privacy.mjs — regenerates the two language blocks of privacy.html.
 *
 * The document follows the structure the client asked for, but the facts in it
 * are this site's, not the template's: the controller is the one named in the
 * imprint, and the processors are the ones the site actually talks to. Those
 * were read off the running site rather than assumed - see NOTES at the bottom
 * for the two items that still need the owner's confirmation.
 *
 *   node tools/build-privacy.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(ROOT, 'privacy.html');

const UPDATED = { hu: '2026. augusztus', en: 'August 2026' };

/* Each section is [id, huTitle, enTitle, huBody, enBody]. Bodies are HTML. */
const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

const SECTIONS = [
  ['s1', 'Bevezetés', 'Introduction',
`<p>Az Ön által megadott személyes adatokat az alábbi vállalkozás kezeli:</p>
<div class="detail-block">
  <p><strong>Hudácsek Bence EV.</strong></p>
  <p>9127 Csikvánd, Hunyadi János utca 12.</p>
  <p>Adószám: 91949811-1-28</p>
  <p>Nyilvántartási szám: 62151177</p>
</div>
<p>a továbbiakban: <strong>Adatkezelő</strong>.</p>
<p>Kérjük, figyelmesen olvassa el jelen adatkezelési tájékoztatónkat (a továbbiakban: Tájékoztató), melyben személyes adatai kezelését érintő gyakorlatunkat ismertetjük az Általános Adatvédelmi Rendelet (a GDPR, azaz az Európai Parlament és a Tanács 2016/679. rendelete) szerint. Ez a Tájékoztató az Adatkezelő szolgáltatásait igénybe vevő személyekre (Ön) vonatkozik. Bemutatja, hogy az Adatkezelő hogyan gyűjti, használja fel és osztja meg bizonyos esetekben harmadik felekkel az Ön személyes adatait, továbbá információval szolgál az Ön adatkezeléssel összefüggő „érintetti” jogairól.</p>
<p>Az Adatkezelő (lásd: <a href="impresszum.html">Impresszum</a>) elkötelezett az e honlapot felkereső egyének személyes adatainak és magánéletének védelme iránt. Jelen Tájékoztató mindenekelőtt az ügyfelek és az érdeklődők személyes adatainak interneten keresztül történő bizalmas kezeléséről és védelméről szól, mindazonáltal ide tartoznak az oldal látogatói is. Az adatok illetéktelen személyek részére nem kerülnek átadásra, és kizárólag az e Tájékoztatóban meghatározott formában kerülnek felhasználásra.</p>
<p>A szerződésekben egyedi esetekben az adatkezelés célja módosulhat, mely az adott szerződésben rögzített feltételekkel történik.</p>
<p>A Tájékoztató fontos információt nyújt Önnek személyes adatai védelméről és az ehhez fűződő jogairól. Ha Ön nem fogadja el ezeket a feltételeket, jogában áll a honlap használatát felfüggeszteni és személyes adat megadása nélkül a böngészést befejezni.</p>`,
`<p>The personal data you provide is processed by:</p>
<div class="detail-block">
  <p><strong>Hudácsek Bence EV.</strong> (sole trader)</p>
  <p>9127 Csikvánd, Hunyadi János utca 12., Hungary</p>
  <p>VAT number: 91949811-1-28</p>
  <p>Registration number: 62151177</p>
</div>
<p>hereinafter: the <strong>Data Controller</strong>.</p>
<p>Please read this privacy notice (the "Notice") carefully. It describes our practice regarding the processing of your personal data under the General Data Protection Regulation (the GDPR, Regulation (EU) 2016/679). This Notice applies to persons using the Data Controller's services (you). It explains how the Data Controller collects, uses and, in certain cases, shares your personal data with third parties, and informs you of your rights as a data subject.</p>
<p>The Data Controller (see the <a href="impresszum.html">Imprint</a>) is committed to protecting the personal data and privacy of individuals visiting this website. This Notice concerns above all the confidential handling and protection of the personal data of clients and enquirers over the internet, but it also covers visitors to the site. Data is not disclosed to unauthorised persons and is used solely in the manner set out in this Notice.</p>
<p>In individual cases a contract may alter the purpose of processing, on the terms recorded in that contract.</p>
<p>This Notice provides you with important information about the protection of your personal data and your related rights. If you do not accept these terms, you are free to discontinue using the website and to end your visit without providing any personal data.</p>`],

  ['s2', 'Az Adatkezelő felelőssége és elérhetősége', 'Responsibility and contact details of the Data Controller',
`<p>A jelen Tájékoztatóban ismertetett adatkezelések tekintetében Hudácsek Bence EV. az adatkezelő.</p>
<p>Adatvédelmi eljárásainkat érintő észrevétel, kérdés vagy panasz esetén az alábbi elérhetőségeken vagyunk elérhetőek:</p>
<div class="detail-block">
  <p>Hudácsek Bence EV., 9127 Csikvánd, Hunyadi János utca 12.</p>
  <p>E-mail: <a href="mailto:hello@automating.hu">hello@automating.hu</a></p>
  <p>Telefon: <a href="tel:+36501089523">+36 (50) 108 9523</a></p>
</div>
<p><strong>Felelősségi kör:</strong> mesterséges intelligenciára épülő automatizálási rendszerek tervezése, fejlesztése és üzemeltetése (hangalapú asszisztensek, e-mail-feldolgozás, munkafolyamat-automatizálás).</p>
<p>Adatvédelmi tisztviselő kijelölésére nem került sor, mivel az Adatkezelő tevékenysége nem esik a GDPR 37. cikke szerinti kötelező esetek körébe.</p>
<p>Választásának megfelelően Ön személyes adatai megadása nélkül is jogosult hozzáférni weboldalunkhoz. Személyes adat minden olyan információ, amely közvetett vagy közvetlen módon azonosítható természetes személyre vonatkozik. Amennyiben az Adatkezelő az Ön személyes adatait gyűjti, az adatgyűjtés átlátható és bizalmas adatkezeléssel történik.</p>
<p>Az Ön személyes adatai olyan információk, amelyek segítségével az Ön személye beazonosítható, például: vezetéknév, utónév, telefonszám, e-mail-cím, cégnév. Ezeket az adatokat Ön önkéntesen adja meg, és minden esetben megjelöljük a cél eléréséhez szükségszerűen megadandó adatokat. Ha nem kívánja megadni ezeket az adatokat, akkor nem férhet hozzá a honlap egyes funkcióihoz. Az Adatkezelő minden intézkedést megtesz annak érdekében, hogy az általa kezelt személyes adatok pontosak és naprakészek legyenek.</p>`,
`<p>For the processing described in this Notice, Hudácsek Bence EV. is the data controller.</p>
<p>For any comment, question or complaint concerning our data protection practice, you can reach us at:</p>
<div class="detail-block">
  <p>Hudácsek Bence EV., 9127 Csikvánd, Hunyadi János utca 12., Hungary</p>
  <p>Email: <a href="mailto:hello@automating.hu">hello@automating.hu</a></p>
  <p>Phone: <a href="tel:+36501089523">+36 (50) 108 9523</a></p>
</div>
<p><strong>Area of activity:</strong> design, development and operation of AI-based automation systems (voice assistants, email processing, workflow automation).</p>
<p>No data protection officer has been appointed, as the Data Controller's activity does not fall within the mandatory cases under Article 37 of the GDPR.</p>
<p>You may access our website without providing any personal data. Personal data means any information relating to a natural person who is identifiable directly or indirectly. Where the Data Controller does collect your personal data, it is collected transparently and handled confidentially.</p>
<p>Your personal data is information by which you can be identified, for example: surname, first name, phone number, email address, company name. You provide this data voluntarily, and we always indicate which fields are necessary to achieve the given purpose. If you choose not to provide them, certain functions of the site will not be available to you. The Data Controller takes every measure to keep the personal data it processes accurate and up to date.</p>`],

  ['s3', 'A kezelt személyes adatok', 'The personal data processed',
`<p>Az alábbi személyes adatok kezelése történik, aszerint hogy Ön a honlap melyik funkcióját használja.</p>
<h3>Konzultáció foglalása</h3>
${ul(['Vezetéknév, keresztnév','E-mail-cím','Telefonszám','Cégnév','Pozíció','Iparág','Az automatizálni kívánt feladat leírása','Döntéshozatali szerep','Egyéb megjegyzés','A foglalás időpontja'])}
<h3>Chat-demó és e-mail-demó</h3>
${ul(['Az Ön által a chat-ablakba írt üzenet szövege','Az e-mail-demóba beillesztett szöveg tartalma','A beszélgetés technikai azonosítója'])}
<p class="note">Kérjük, ne illesszen a demókba valós ügyfél-adatot vagy más érzékeny információt: a beírt szöveget nyelvi modell dolgozza fel.</p>
<h3>Hang-demó</h3>
${ul(['A mikrofonon keresztül rögzített hangja a hívás időtartama alatt','A beszélgetés szöveges átirata','A hívás technikai adatai (időtartam, azonosító)'])}
<p class="note">A hang-demó csak akkor indul el, ha Ön kifejezetten elindítja, és a böngésző külön engedélyt kér a mikrofon használatához.</p>
<h3>Kapcsolatfelvétel e-mailben</h3>
${ul(['Az Ön e-mail-címe és neve','A levelezés tartalma'])}
<h3>Automatikusan gyűjtött rendszerinformációk</h3>
${ul(['IP-cím','Böngésző és operációs rendszer típusa, verziója','Képernyőfelbontás','A megtekintett oldalak és a látogatás időpontja'])}`,
`<p>The following personal data is processed, depending on which function of the site you use.</p>
<h3>Booking a consultation</h3>
${ul(['Surname, first name','Email address','Phone number','Company name','Position','Industry','Description of the task to be automated','Role in decision-making','Other comments','Time of the booking'])}
<h3>Chat demo and email demo</h3>
${ul(['The text of the message you type into the chat window','The content of the text you paste into the email demo','The technical identifier of the conversation'])}
<p class="note">Please do not paste real client data or other sensitive information into the demos: the text you enter is processed by a language model.</p>
<h3>Voice demo</h3>
${ul(['Your voice as captured by the microphone for the duration of the call','The text transcript of the conversation','Technical data of the call (duration, identifier)'])}
<p class="note">The voice demo only starts if you explicitly start it, and your browser asks separately for permission to use the microphone.</p>
<h3>Contact by email</h3>
${ul(['Your email address and name','The content of the correspondence'])}
<h3>Automatically collected system information</h3>
${ul(['IP address','Browser and operating system type and version','Screen resolution','The pages viewed and the time of the visit'])}`],

  ['s4', 'Az adatkezelés célja, jogalapja és időtartama', 'Purpose, legal basis and duration of processing',
`<table class="policy-table">
<thead><tr><th>Adatkezelés</th><th>Cél</th><th>Jogalap</th><th>Időtartam</th></tr></thead>
<tbody>
<tr><td data-label="Adatkezelés">Konzultáció foglalása</td><td data-label="Cél">Kapcsolatfelvétel, ajánlatadás, a megbeszélés előkészítése</td><td data-label="Jogalap">Az Ön hozzájárulása, illetve szerződéskötést megelőző lépések (GDPR 6. cikk (1) a) és b))</td><td data-label="Időtartam">A hozzájárulás visszavonásáig, de legfeljebb az utolsó kapcsolatfelvételtől számított 2 évig</td></tr>
<tr><td data-label="Adatkezelés">Chat- és e-mail-demó</td><td data-label="Cél">A demó működtetése, a válasz előállítása</td><td data-label="Jogalap">Hozzájárulás (6. cikk (1) a))</td><td data-label="Időtartam">A munkamenet végéig; a hibakereséshez szükséges naplók legfeljebb 30 napig</td></tr>
<tr><td data-label="Adatkezelés">Hang-demó</td><td data-label="Cél">A demó működtetése, a beszélgetés lebonyolítása</td><td data-label="Jogalap">Hozzájárulás (6. cikk (1) a))</td><td data-label="Időtartam">A hívás végéig; az átirat és a technikai napló legfeljebb 30 napig</td></tr>
<tr><td data-label="Adatkezelés">Kapcsolatfelvétel e-mailben</td><td data-label="Cél">A megkeresés megválaszolása</td><td data-label="Jogalap">Hozzájárulás, illetve jogos érdek (6. cikk (1) a) és f))</td><td data-label="Időtartam">Az ügy lezárásától számított 2 évig</td></tr>
<tr><td data-label="Adatkezelés">Szerződéses ügyfelek adatai</td><td data-label="Cél">A szerződés teljesítése</td><td data-label="Jogalap">Szerződés teljesítése (6. cikk (1) b))</td><td data-label="Időtartam">A szerződés megszűnésétől számított 5 évig (Ptk. 6:22. §)</td></tr>
<tr><td data-label="Adatkezelés">Számlázási adatok</td><td data-label="Cél">Jogszabályi kötelezettség teljesítése</td><td data-label="Jogalap">Jogi kötelezettség (6. cikk (1) c))</td><td data-label="Időtartam">8 év, a Számv. tv. 169. § (2) bekezdése alapján</td></tr>
<tr><td data-label="Adatkezelés">Rendszerinformációk</td><td data-label="Cél">A honlap biztonságos üzemeltetése</td><td data-label="Jogalap">Jogos érdek (6. cikk (1) f))</td><td data-label="Időtartam">Legfeljebb 30 nap</td></tr>
</tbody></table>
<p>Direkt marketing célú hozzájárulás esetén az adatkezelés a hozzájárulás visszavonásáig tart. A hozzájárulás bármikor, indokolás nélkül visszavonható; a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét.</p>`,
`<table class="policy-table">
<thead><tr><th>Processing</th><th>Purpose</th><th>Legal basis</th><th>Duration</th></tr></thead>
<tbody>
<tr><td data-label="Processing">Booking a consultation</td><td data-label="Purpose">Contact, quotation, preparing the meeting</td><td data-label="Legal basis">Your consent and pre-contractual steps (GDPR Art. 6(1)(a) and (b))</td><td data-label="Duration">Until consent is withdrawn, at most 2 years from the last contact</td></tr>
<tr><td data-label="Processing">Chat and email demo</td><td data-label="Purpose">Operating the demo, producing the reply</td><td data-label="Legal basis">Consent (Art. 6(1)(a))</td><td data-label="Duration">Until the end of the session; debugging logs for at most 30 days</td></tr>
<tr><td data-label="Processing">Voice demo</td><td data-label="Purpose">Operating the demo, conducting the conversation</td><td data-label="Legal basis">Consent (Art. 6(1)(a))</td><td data-label="Duration">Until the end of the call; transcript and technical log for at most 30 days</td></tr>
<tr><td data-label="Processing">Contact by email</td><td data-label="Purpose">Answering your enquiry</td><td data-label="Legal basis">Consent and legitimate interest (Art. 6(1)(a) and (f))</td><td data-label="Duration">2 years from closing the matter</td></tr>
<tr><td data-label="Processing">Client data under contract</td><td data-label="Purpose">Performance of the contract</td><td data-label="Legal basis">Performance of a contract (Art. 6(1)(b))</td><td data-label="Duration">5 years from termination of the contract</td></tr>
<tr><td data-label="Processing">Invoicing data</td><td data-label="Purpose">Compliance with a legal obligation</td><td data-label="Legal basis">Legal obligation (Art. 6(1)(c))</td><td data-label="Duration">8 years under Section 169(2) of the Hungarian Accounting Act</td></tr>
<tr><td data-label="Processing">System information</td><td data-label="Purpose">Secure operation of the website</td><td data-label="Legal basis">Legitimate interest (Art. 6(1)(f))</td><td data-label="Duration">At most 30 days</td></tr>
</tbody></table>
<p>Where consent is given for direct marketing, processing continues until that consent is withdrawn. Consent may be withdrawn at any time without giving reasons; withdrawal does not affect the lawfulness of processing carried out beforehand.</p>`],

  ['s5', 'Adattovábbítás feltételei', 'Conditions of data transfer',
`<p>Az Adatkezelő az általa kezelt adatokat – a szükséges mértékben – továbbíthatja a következő területeken tevékenykedő, általa kijelölt személyek, valamint társaságok részére:</p>
${ul(['Adatfeldolgozás','Jogi képviselet','Jogviták kezelésére jogszabály alapján jogosult szervek','Kézbesítés','Könyvelés','Követeléskezelés','Számlázás'])}
<p>Az adatok illetéktelen harmadik személyek részére nem kerülnek átadásra, és az Adatkezelő azokat nem értékesíti.</p>`,
`<p>The Data Controller may transfer the data it processes – to the extent necessary – to persons and companies designated by it and active in the following areas:</p>
${ul(['Data processing','Legal representation','Bodies entitled by law to handle legal disputes','Delivery','Accounting','Debt management','Invoicing'])}
<p>Data is not passed to unauthorised third parties, and the Data Controller does not sell it.</p>`],

  ['s6', 'Adatfeldolgozók', 'Data processors',
`<p>Az adatok kezelését az Adatkezelő végzi. Az Adatkezelőn kívül az alábbi cégek vesznek részt az adatok kezelésében, illetve tárolásában:</p>
<div class="proc">
  <h3>Cloudflare, Inc. — tárhely és tartalomkézbesítés</h3>
  ${ul(['Cím: 101 Townsend St, San Francisco, CA 94107, USA','Weboldal: <a href="https://www.cloudflare.com/">https://www.cloudflare.com/</a>','E-mail: <a href="mailto:support@cloudflare.com">support@cloudflare.com</a>','Kezelt adatok: a honlap kiszolgálása során keletkező technikai adatok, IP-cím'])}
</div>
<div class="proc">
  <h3>Cal.com, Inc. — időpontfoglalás</h3>
  ${ul(['Weboldal: <a href="https://cal.com/">https://cal.com/</a>','Kezelt adatok: a konzultációfoglaló űrlapon megadott adatok és a foglalás időpontja'])}
</div>
<div class="proc">
  <h3>Vapi Labs, Inc. — hang-demó</h3>
  ${ul(['Weboldal: <a href="https://vapi.ai/">https://vapi.ai/</a>','Kezelt adatok: a hang-demó során rögzített hang, annak átirata és a hívás technikai adatai'])}
</div>
<div class="proc">
  <h3>Google Ireland Ltd. — betűtípusok kiszolgálása</h3>
  ${ul(['Cím: Gordon House, Barrow Street, Dublin 4, Írország','Kezelt adatok: a betűtípusok letöltésekor továbbított IP-cím','Adatvédelem: <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>'])}
</div>
<p>A chat-, az e-mail- és a hang-demó válaszait nagy nyelvi modell állítja elő. A modellt üzemeltető szolgáltató az Adatkezelő nevében adatfeldolgozóként jár el; a demókba beírt szöveg ehhez a szolgáltatóhoz továbbításra kerül. Ezért kérjük, hogy a demókba ne írjon be valós személyes vagy üzleti titkot képező adatot.</p>
<p>Speciális esetekben a szerződés további adatfeldolgozó személyeket vagy cégeket tartalmazhat.</p>
<p><strong>Harmadik országba történő továbbítás:</strong> a fent megjelölt egyes szolgáltatók az Európai Gazdasági Térségen kívül (elsősorban az Amerikai Egyesült Államokban) is kezelhetnek adatokat. Az ilyen továbbítás a GDPR V. fejezete szerinti garanciák – így az Európai Bizottság megfelelőségi határozata vagy általános szerződési feltételek – mellett történik.</p>`,
`<p>Data is processed by the Data Controller. Besides the Data Controller, the following companies take part in processing or storing the data:</p>
<div class="proc">
  <h3>Cloudflare, Inc. — hosting and content delivery</h3>
  ${ul(['Address: 101 Townsend St, San Francisco, CA 94107, USA','Website: <a href="https://www.cloudflare.com/">https://www.cloudflare.com/</a>','Email: <a href="mailto:support@cloudflare.com">support@cloudflare.com</a>','Data processed: technical data arising while serving the site, IP address'])}
</div>
<div class="proc">
  <h3>Cal.com, Inc. — appointment booking</h3>
  ${ul(['Website: <a href="https://cal.com/">https://cal.com/</a>','Data processed: the details entered in the booking form and the time of the booking'])}
</div>
<div class="proc">
  <h3>Vapi Labs, Inc. — voice demo</h3>
  ${ul(['Website: <a href="https://vapi.ai/">https://vapi.ai/</a>','Data processed: the voice captured during the demo, its transcript and technical call data'])}
</div>
<div class="proc">
  <h3>Google Ireland Ltd. — font delivery</h3>
  ${ul(['Address: Gordon House, Barrow Street, Dublin 4, Ireland','Data processed: the IP address transmitted when the fonts are downloaded','Privacy: <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>'])}
</div>
<p>The replies in the chat, email and voice demos are produced by a large language model. The provider operating the model acts as a processor on behalf of the Data Controller; the text you enter into the demos is transmitted to that provider. Please therefore do not enter real personal data or business secrets into the demos.</p>
<p>In special cases a contract may name further processors.</p>
<p><strong>Transfer to third countries:</strong> some of the providers listed above may also process data outside the European Economic Area, primarily in the United States. Any such transfer takes place with the safeguards required by Chapter V of the GDPR, such as an adequacy decision of the European Commission or standard contractual clauses.</p>`],

  ['s7', 'Az Ön jogai és jogérvényesítés', 'Your rights and how to exercise them',
`<p>Az adatkezelés teljes időtartama alatt Önt megilletik az alábbi jogok:</p>
${ul([
'<strong>Hozzáférés:</strong> tájékoztatást kérhet arról, hogy kezeljük-e a személyes adatait, és ha igen, másolatot kérhet azokról.',
'<strong>Helyesbítés:</strong> kérheti a pontatlan adatok javítását, a hiányos adatok kiegészítését.',
'<strong>Törlés („elfeledtetéshez való jog”):</strong> kérheti adatai törlését, ha azok kezelésére már nincs szükség, vagy ha visszavonja a hozzájárulását.',
'<strong>Az adatkezelés korlátozása:</strong> kérheti, hogy adatait csak tároljuk, de egyéb módon ne kezeljük.',
'<strong>Adathordozhatóság:</strong> kérheti, hogy adatait tagolt, géppel olvasható formátumban adjuk ki Önnek vagy egy másik adatkezelőnek.',
'<strong>Tiltakozás:</strong> tiltakozhat a jogos érdeken alapuló adatkezelés ellen, valamint bármikor, indokolás nélkül a közvetlen üzletszerzés célú adatkezelés ellen.',
'<strong>A hozzájárulás visszavonása:</strong> a hozzájáruláson alapuló adatkezelést bármikor leállíthatja.',
])}
<p>Amennyiben nem szeretné személyes adatai kereskedelmi ajánlatok közlésére történő felhasználását, joga van mindezt indoklás nélkül megtiltani. Kérelmét írásban szükséges megküldenie az Adatkezelő részére, e-mailben a <a href="mailto:hello@automating.hu">hello@automating.hu</a> címre, vagy postai levélben az Impresszumban megjelölt címre.</p>
<p>Kérelmére indokolatlan késedelem nélkül, de legkésőbb a kérelem beérkezésétől számított egy hónapon belül válaszolunk.</p>
<h3>Panasz és jogorvoslat</h3>
<p>Ha úgy véli, hogy az adatkezelés sérti a jogait, panasszal fordulhat a felügyeleti hatósághoz:</p>
<div class="detail-block">
  <p><strong>Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</strong></p>
  <p>1055 Budapest, Falk Miksa utca 9-11.</p>
  <p>Telefon: +36 (1) 391-1400</p>
  <p>E-mail: <a href="mailto:ugyfelszolgalat@naih.hu">ugyfelszolgalat@naih.hu</a></p>
  <p>Weboldal: <a href="https://naih.hu">naih.hu</a></p>
</div>
<p>Jogainak megsértése esetén bírósághoz is fordulhat. A per elbírálása a törvényszék hatáskörébe tartozik, és az Ön választása szerint a lakóhelye vagy tartózkodási helye szerinti törvényszék előtt is megindítható.</p>`,
`<p>Throughout the processing you have the following rights:</p>
${ul([
'<strong>Access:</strong> you may ask whether we process your personal data and, if so, request a copy of it.',
'<strong>Rectification:</strong> you may ask us to correct inaccurate data and complete incomplete data.',
'<strong>Erasure ("right to be forgotten"):</strong> you may ask us to delete your data if it is no longer needed or if you withdraw your consent.',
'<strong>Restriction of processing:</strong> you may ask us to store your data but otherwise not process it.',
'<strong>Data portability:</strong> you may ask us to provide your data in a structured, machine-readable format to you or to another controller.',
'<strong>Objection:</strong> you may object to processing based on legitimate interest, and at any time, without giving reasons, to processing for direct marketing.',
'<strong>Withdrawal of consent:</strong> you may stop processing based on consent at any time.',
])}
<p>If you do not wish your personal data to be used for commercial offers, you have the right to prohibit this without giving reasons. Your request must be sent to the Data Controller in writing, by email to <a href="mailto:hello@automating.hu">hello@automating.hu</a> or by post to the address given in the Imprint.</p>
<p>We answer requests without undue delay, and at the latest within one month of receiving them.</p>
<h3>Complaints and remedies</h3>
<p>If you believe the processing infringes your rights, you may lodge a complaint with the supervisory authority:</p>
<div class="detail-block">
  <p><strong>Hungarian National Authority for Data Protection and Freedom of Information (NAIH)</strong></p>
  <p>1055 Budapest, Falk Miksa utca 9-11., Hungary</p>
  <p>Phone: +36 (1) 391-1400</p>
  <p>Email: <a href="mailto:ugyfelszolgalat@naih.hu">ugyfelszolgalat@naih.hu</a></p>
  <p>Website: <a href="https://naih.hu">naih.hu</a></p>
</div>
<p>You may also go to court. Such proceedings fall within the competence of the regional court and may, at your choice, be brought before the court of your domicile or residence.</p>`],

  ['s8', 'Kiskorúak és korlátozottan cselekvőképes személyek adatainak védelme', 'Protection of the data of minors and persons with limited capacity',
`<p>Az Adatkezelő weboldala és megjelenéseinek tartalma nem 16 év alatti kiskorúak részére szól. Nem kezelünk és nem gyűjtünk 16 év alatti gyermekekről személyes adatokat igazolható szülői vagy gondviselői hozzájárulás nélkül. A szülők vagy gondviselők kérhetik a gyermekre vonatkozó adatok kiadását vagy törlését. Ha az Adatkezelő számára az adatkezelés folyamán válik nyilvánvalóvá az életkor, abban az esetben az adatok kizárólag a szülői hozzájárulás beszerzése céljából használhatók fel.</p>
<p>Cselekvőképtelen és korlátozottan cselekvőképes kiskorú személy nyilatkozatához a törvényes képviselő hozzájárulása szükséges, kivéve a mindennapi életben tömegesen előforduló, különösebb megfontolást nem igénylő szolgáltatásrészeket.</p>`,
`<p>The Data Controller's website and its content are not aimed at minors under the age of 16. We do not process or collect personal data about children under 16 without verifiable parental or guardian consent. Parents or guardians may request the disclosure or deletion of data relating to their child. If the age becomes apparent to the Data Controller during processing, the data may be used solely for the purpose of obtaining parental consent.</p>
<p>A statement by a minor lacking capacity or with limited capacity requires the consent of their legal representative, except for parts of the service that occur routinely in everyday life and require no particular consideration.</p>`],

  ['s9', 'Adatbiztonság', 'Data security',
`<p>Az Adatkezelő megfelelő technikai és szervezési intézkedésekkel gondoskodik a személyes adatok biztonságáról. Ezek különösen: a honlap és a háttérrendszerek titkosított (HTTPS) kapcsolaton keresztüli elérése, a hozzáférések jelszavas és kétlépcsős védelme, a jogosultságok szükséges mértékre korlátozása, valamint a rendszerek rendszeres frissítése.</p>
<p>Adatvédelmi incidens esetén az Adatkezelő azt indokolatlan késedelem nélkül, de legkésőbb 72 órán belül bejelenti a felügyeleti hatóságnak, kivéve, ha az incidens valószínűsíthetően nem jár kockázattal. Ha az incidens valószínűsíthetően magas kockázattal jár az Ön jogaira nézve, Önt is tájékoztatjuk.</p>`,
`<p>The Data Controller ensures the security of personal data by appropriate technical and organisational measures. These include in particular: access to the website and back-end systems over encrypted (HTTPS) connections, password and two-factor protection of accounts, limiting permissions to what is necessary, and keeping systems up to date.</p>
<p>In the event of a personal data breach, the Data Controller notifies the supervisory authority without undue delay and at the latest within 72 hours, unless the breach is unlikely to result in a risk. Where the breach is likely to result in a high risk to your rights, we will also inform you.</p>`],

  ['s10', 'Sütik (cookie-k) kezelése', 'Cookies',
`<p>Weboldalunkon „cookie”-kat (továbbiakban „süti”) alkalmazhatunk. Ezek olyan fájlok, melyek információt tárolnak az Ön webes böngészőjében. A nem feltétlenül szükséges sütik elhelyezéséhez az Ön hozzájárulása szükséges.</p>
<p>A sütiket az elektronikus hírközlésről szóló 2003. évi C. törvény, az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény, valamint az Európai Unió előírásainak megfelelően használjuk. Az Európai Unió országain belül működő weblapoknak a sütik használatához és tárolásához a felhasználók hozzájárulását kell kérniük.</p>
<h3>1. Mik azok a sütik?</h3>
<p>A sütik olyan kisméretű fájlok, melyek betűket és számokat tartalmaznak. A süti a webszerver és a felhasználó böngészője közötti információcsere eszköze. Ezek az adatfájlok nem futtathatók, nem tartalmaznak kémprogramokat és vírusokat, továbbá nem férhetnek hozzá a felhasználók merevlemezének tartalmához.</p>
<h3>2. Mire használhatók a sütik?</h3>
<p>A sütik által küldött információk segítségével az internetböngészők könnyebben felismerhetők, így a felhasználók releváns tartalmat kapnak. A sütik kényelmesebbé teszik a böngészést. Segítségükkel a weboldalak üzemeltetői névtelen statisztikákat is készíthetnek az oldallátogatók szokásairól.</p>
<h3>3. Milyen sütikkel találkozhat?</h3>
${ul([
'<strong>Ideiglenes sütik</strong>, melyek addig maradnak az eszközén, amíg el nem hagyja a weboldalt.',
'<strong>Állandó sütik</strong>, melyek a böngésző beállításától függően hosszabb ideig vagy egészen addig az eszközén maradnak, amíg azokat Ön nem törli.',
'<strong>Harmadik féltől származó sütik</strong>, melyeket harmadik fél helyez el az Ön böngészőjében, ha a meglátogatott weboldal használja az adott szolgáltatásait.',
])}
<h3>4. A sütik típusai</h3>
${ul([
'<strong>Elengedhetetlen munkamenet-sütik:</strong> használatuk elengedhetetlen a weboldalon történő navigáláshoz és a funkciók működéséhez. Ezek nélkül a honlap egyes részei nem, vagy hibásan jelenhetnek meg.',
'<strong>Analitikai vagy teljesítményfigyelő sütik:</strong> segítenek megkülönböztetni a látogatókat, és adatokat gyűjtenek arról, hogyan viselkednek a weboldalon. Ezek nem gyűjtenek azonosításra alkalmas információt, az adatokat összesítve és névtelenül tárolják.',
'<strong>Funkcionális sütik:</strong> feladatuk a felhasználói élmény javítása. Észlelik és tárolják például a választott nyelvet vagy a korábban megadott beállításokat.',
'<strong>Célzott vagy reklámsütik:</strong> ezek segítségével a weboldalak az érdeklődési körnek megfelelő hirdetést tudnak megjeleníteni. Ehhez az Ön kifejezett beleegyezése szükséges.',
])}
<h3>5. Amit ez a honlap ténylegesen használ</h3>
<p>Jelen honlap <strong>nem használ analitikai, statisztikai vagy reklámcélú sütit</strong>, és nem futtat harmadik féltől származó nyomkövető szkriptet. Az Ön böngészőjében kizárólag a működéshez szükséges technikai tárolás történik: a választott nyelv megjegyzése, valamint a demók munkamenetének azonosítója. Ezek az adatok az Ön eszközét nem hagyják el, és nem alkalmasak az Ön azonosítására.</p>
<h3>6. Tartalmaznak a sütik személyes adatot?</h3>
<p>A legtöbb süti nem tartalmaz személyes információt, segítségével a felhasználók nem azonosíthatók. A tárolt adatok a kényelmesebb böngészésért szükségesek, tárolásuk olyan módon történik, hogy jogosulatlan személy ne férhessen hozzájuk.</p>
<h3>7. Biztonsággal kapcsolatos tényezők</h3>
<p>A sütik nem vírusok és nem kémprogramok. Mivel egyszerű szöveg típusú fájlok, nem futtathatók, tehát nem tekinthetők programoknak. Mivel azonban a böngésző és a webszerver folyamatosan kommunikál, egy támadó – például nem megfelelően titkosított hálózaton – kinyerheti a sütik által tárolt információkat.</p>
<h3>8. A sütik kezelése, törlése</h3>
<p>A sütiket a használt böngészőprogramban lehet törölni vagy letiltani. A böngészők alapértelmezett módon engedélyezik a sütik elhelyezését; ez a böngésző beállításainál letiltható, a meglévők pedig törölhetők. Beállítható az is, hogy a böngésző értesítést küldjön, amikor sütit küld az eszközre. Fontos hangsúlyozni, hogy ezen fájlok letiltása vagy korlátozása ronthatja a böngészési élményt, és hibát okozhat a weboldal működésében. A beállítási lehetőségek általában a böngésző „Opciók” vagy „Beállítások” menüpontjában találhatók.</p>`,
`<p>We may use cookies on our website. These are files that store information in your web browser. Placing cookies that are not strictly necessary requires your consent.</p>
<p>We use cookies in accordance with Act C of 2003 on electronic communications, Act CVIII of 2001 on electronic commerce services, and the requirements of the European Union. Websites operating within EU countries must ask users for consent to the use and storage of cookies.</p>
<h3>1. What are cookies?</h3>
<p>Cookies are small files containing letters and numbers. A cookie is a means of exchanging information between the web server and the user's browser. These data files cannot be executed, contain no spyware or viruses, and cannot access the contents of the user's hard drive.</p>
<h3>2. What can cookies be used for?</h3>
<p>The information sent by cookies makes browsers easier to recognise, so users receive relevant content. Cookies make browsing more convenient. They also allow site operators to compile anonymous statistics about visitor habits.</p>
<h3>3. What kinds of cookies are there?</h3>
${ul([
'<strong>Session cookies</strong>, which remain on your device until you leave the website.',
'<strong>Persistent cookies</strong>, which — depending on your browser settings — stay on your device for longer, or until you delete them.',
'<strong>Third-party cookies</strong>, placed in your browser by a third party where the site you visit uses that third party’s services.',
])}
<h3>4. Types of cookies</h3>
${ul([
'<strong>Strictly necessary session cookies:</strong> essential for navigating the site and for its functions to work. Without them parts of the site may not display, or may display incorrectly.',
'<strong>Analytical or performance cookies:</strong> these help distinguish visitors and collect data on how they behave on the site. They collect no identifying information and store data in aggregated, anonymous form.',
'<strong>Functional cookies:</strong> these improve the user experience. They detect and store, for example, the chosen language or settings you provided earlier.',
'<strong>Targeting or advertising cookies:</strong> these allow websites to show advertising matching your interests. They require your explicit consent.',
])}
<h3>5. What this site actually uses</h3>
<p>This website <strong>uses no analytical, statistical or advertising cookies</strong>, and runs no third-party tracking script. Only technical storage necessary for operation takes place in your browser: remembering the chosen language and the session identifier of the demos. This data does not leave your device and cannot identify you.</p>
<h3>6. Do cookies contain personal data?</h3>
<p>Most cookies contain no personal information and cannot identify users. The stored data serves more convenient browsing and is stored so that unauthorised persons cannot access it.</p>
<h3>7. Security considerations</h3>
<p>Cookies are not viruses or spyware. As simple text files they cannot be executed and are therefore not programs. However, because the browser and the web server communicate continuously, an attacker — for example on an inadequately encrypted network — could extract the information stored in cookies.</p>
<h3>8. Managing and deleting cookies</h3>
<p>Cookies can be deleted or blocked in the browser you use. Browsers allow cookies by default; this can be disabled in the browser settings and existing cookies deleted. You can also set your browser to notify you when a cookie is sent to your device. Note that blocking or limiting these files may degrade the browsing experience and cause errors in the operation of the website. The settings are usually found under the browser's "Options" or "Settings" menu.</p>`],

  ['s11', 'Fogalmak', 'Definitions',
`${ul([
'<strong>Adatfeldolgozó:</strong> természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, amely az adatkezelő nevében személyes adatokat kezel.',
'<strong>Adatkezelés:</strong> a személyes adatokon vagy adatállományokon automatizált vagy nem automatizált módon végzett bármely művelet vagy műveletek összessége, például: gyűjtés, rögzítés, rendszerezés, tagolás, tárolás, átalakítás, megváltoztatás, lekérdezés, betekintés, felhasználás, közlés, továbbítás, terjesztés, összehangolás, összekapcsolás, korlátozás, törlés, megsemmisítés.',
'<strong>Adattovábbítás:</strong> az Adatkezelő által kezelt személyes adatok harmadik személyek számára történő hozzáférhetővé tétele.',
'<strong>Adatvédelmi incidens:</strong> a biztonság sérülése, amely a továbbított, tárolt vagy más módon kezelt személyes adatok véletlen vagy jogellenes megsemmisítését, elvesztését, megváltoztatását, jogosulatlan közlését vagy az azokhoz való jogosulatlan hozzáférést eredményezi.',
'<strong>ÁSZF:</strong> a weboldalon közzétett, az Adatkezelő szolgáltatás-értékesítési szabályait rögzítő <a href="terms.html">Általános Szerződési Feltételek</a>.',
'<strong>Azonosítható természetes személy:</strong> az a természetes személy, aki közvetlen vagy közvetett módon, valamely azonosító – például név, azonosító szám, helymeghatározó adat, online azonosító – vagy a fizikai, fiziológiai, genetikai, szellemi, gazdasági, kulturális vagy szociális azonosságára vonatkozó egy vagy több tényező alapján azonosítható.',
'<strong>Címzett:</strong> természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, amellyel a személyes adatot közlik, függetlenül attól, hogy harmadik fél-e.',
'<strong>Érintett:</strong> bármely információ alapján azonosított vagy azonosítható természetes személy.',
'<strong>Érintett hozzájárulása:</strong> az érintett akaratának önkéntes, konkrét, megfelelő tájékoztatáson alapuló, egyértelmű kinyilvánítása, amellyel jelzi, hogy beleegyezését adja az őt érintő személyes adatok kezeléséhez.',
'<strong>Felhasználók:</strong> az Adatkezelő által üzemeltetett, a <a href="https://automating.hu">https://automating.hu</a> címen és az ott meghatározott egyéb címeken elérhető weboldalak látogatói.',
'<strong>Harmadik fél:</strong> természetes vagy jogi személy, közhatalmi szerv, ügynökség vagy bármely egyéb szerv, amely nem azonos az érintettel, az adatkezelővel, az adatfeldolgozóval vagy azokkal a személyekkel, akik az adatkezelő vagy adatfeldolgozó közvetlen irányítása alatt a személyes adatok kezelésére felhatalmazást kaptak.',
'<strong>Hatóság:</strong> Nemzeti Adatvédelmi és Információszabadság Hatóság (székhely: 1055 Budapest, Falk Miksa utca 9-11., telefon: +36 (1) 391-1400, e-mail: <a href="mailto:ugyfelszolgalat@naih.hu">ugyfelszolgalat@naih.hu</a>, weboldal: <a href="https://naih.hu">naih.hu</a>).',
'<strong>Partner/Ügyfél:</strong> az a természetes személy, aki az Adatkezelővel szerződést köt szolgáltatás nyújtására.',
'<strong>Személyes adat:</strong> az érintettre vonatkozó bármely információ.',
'<strong>Szolgáltatás:</strong> az Adatkezelő által Ügyfelei, Partnerei és Felhasználói részére a weboldalon vagy egyéb módon nyújtott, az ÁSZF-ben részletezett szolgáltatások.',
'<strong>Weboldal:</strong> az Adatkezelő által üzemeltetett, a <a href="https://automating.hu">https://automating.hu</a> címen és az ott meghatározott egyéb címeken elérhető weboldalai.',
])}`,
`${ul([
'<strong>Processor:</strong> a natural or legal person, public authority, agency or any other body which processes personal data on behalf of the controller.',
'<strong>Processing:</strong> any operation or set of operations performed on personal data or on sets of personal data, whether or not by automated means, such as collection, recording, organisation, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure, transmission, dissemination, alignment, combination, restriction, erasure or destruction.',
'<strong>Data transfer:</strong> making the personal data processed by the Data Controller accessible to third persons.',
'<strong>Personal data breach:</strong> a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data transmitted, stored or otherwise processed.',
'<strong>GTC:</strong> the <a href="terms.html">General Terms and Conditions</a> published on the website, setting out the Data Controller’s rules for selling services.',
'<strong>Identifiable natural person:</strong> a natural person who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to their physical, physiological, genetic, mental, economic, cultural or social identity.',
'<strong>Recipient:</strong> a natural or legal person, public authority, agency or another body to which the personal data are disclosed, whether a third party or not.',
'<strong>Data subject:</strong> a natural person identified or identifiable on the basis of any information.',
'<strong>Consent of the data subject:</strong> any freely given, specific, informed and unambiguous indication of the data subject’s wishes by which they signify agreement to the processing of personal data relating to them.',
'<strong>Users:</strong> visitors to the websites operated by the Data Controller at <a href="https://automating.hu">https://automating.hu</a> and at the other addresses specified there.',
'<strong>Third party:</strong> a natural or legal person, public authority, agency or body other than the data subject, controller, processor and persons who, under the direct authority of the controller or processor, are authorised to process personal data.',
'<strong>Authority:</strong> Hungarian National Authority for Data Protection and Freedom of Information (seat: 1055 Budapest, Falk Miksa utca 9-11., phone: +36 (1) 391-1400, email: <a href="mailto:ugyfelszolgalat@naih.hu">ugyfelszolgalat@naih.hu</a>, website: <a href="https://naih.hu">naih.hu</a>).',
'<strong>Partner/Client:</strong> a natural person who enters into a contract with the Data Controller for the provision of services.',
'<strong>Personal data:</strong> any information relating to the data subject.',
'<strong>Service:</strong> the services detailed in the GTC and provided by the Data Controller to its Clients, Partners and Users on the website or otherwise.',
'<strong>Website:</strong> the websites operated by the Data Controller at <a href="https://automating.hu">https://automating.hu</a> and at the other addresses specified there.',
])}`],

  ['s12', 'A Tájékoztató módosítása', 'Amendment of this Notice',
`<p>Az Adatkezelő fenntartja a jogot, hogy a jelen Tájékoztatót egyoldalúan módosítsa, különösen jogszabályváltozás vagy a szolgáltatás változása esetén. A módosított Tájékoztató a honlapon való közzététellel lép hatályba. Kérjük, hogy időről időre tekintse át a jelen oldalt.</p>
<p>Jelen Tájékoztató hatálybalépésének napja: ${UPDATED.hu}.</p>`,
`<p>The Data Controller reserves the right to amend this Notice unilaterally, in particular where legislation or the service changes. The amended Notice takes effect upon publication on the website. Please review this page from time to time.</p>
<p>This Notice took effect in ${UPDATED.en}.</p>`],
];

const block = lang => {
  const t = lang === 'hu' ? 0 : 1;
  const title = lang === 'hu' ? 'Adatvédelmi nyilatkozat.' : 'Privacy Notice.';
  const meta  = lang === 'hu'
    ? `Utolsó frissítés: ${UPDATED.hu} &nbsp;·&nbsp; automating.hu`
    : `Last updated: ${UPDATED.en} &nbsp;·&nbsp; automating.hu`;
  const tocTitle = lang === 'hu' ? 'Tartalom' : 'Contents';
  const idFor = s => lang === 'hu' ? `hu-${s[0]}` : s[0];
  const toc = SECTIONS.map((s, i) =>
    `          <li><a href="#${idFor(s)}">${i + 1}. ${s[1 + t]}</a></li>`).join('\n');
  const body = SECTIONS.map((s, i) => `        <div class="policy-section" id="${idFor(s)}">
          <h2>${i + 1}. ${s[1 + t]}</h2>
${(s[3 + t]).split('\n').map(l => '          ' + l).join('\n')}
        </div>
        <hr class="policy-divider">`).join('\n\n');

  return `      <div class="policy-header">
        <h${lang === 'hu' ? '1' : '2'} class="policy-title">${title}</h${lang === 'hu' ? '1' : '2'}>
        <p class="meta">${meta}</p>
      </div>

      <div class="policy-body">

        <aside class="policy-toc">
          <h3>${tocTitle}</h3>
          <ul>
${toc}
          </ul>
        </aside>

        <div class="policy-content">

${body}

        </div>
      </div>`;
};

let html = fs.readFileSync(FILE, 'utf8');
const cut = (open, close) => {
  const a = html.indexOf(open); const b = html.indexOf(close, a);
  if (a < 0 || b < 0) { console.error(`marker not found: ${open}`); process.exit(1); }
  return [a + open.length, b];
};

for (const [lang, open, close] of [
  ['hu', '<div class="lang-block active" data-lang="hu">', '<!-- /lang-block HU -->'],
  ['en', '<div class="lang-block" data-lang="en">', '<!-- /lang-block EN -->'],
]) {
  const [a, b] = cut(open, close);
  html = html.slice(0, a) + '\n' + block(lang) + '\n    </div>\n    ' + html.slice(b);
}

/* the document is renamed everywhere it names itself */
html = html.replace(/<title>[^<]*<\/title>/, '<title>Adatvédelmi nyilatkozat · Automating</title>');
fs.writeFileSync(FILE, html);
console.log(`privacy.html regenerated — ${SECTIONS.length} sections per language`);
