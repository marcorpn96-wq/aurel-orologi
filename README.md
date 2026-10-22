# AUREL — Orologi di lusso

Sito e-commerce dimostrativo in italiano, costruito con HTML, CSS, JavaScript e PHP. Marchio, orologi, prezzi e caratteristiche sono inventati. Non incassa denaro, non spedisce prodotti e non invia email.

## Pagine e funzioni

- Home con selettore dei quattro modelli e animazioni prospettiche.
- Orologi: filtri per stile e ordinamento per prezzo.
- Notturno, Pelagos, Meridiano e Aureo: quattro pagine prodotto con illustrazione SVG originale, vista prospettica, ingrandimento, specifiche e prezzo.
- Chi siamo e Contatti.
- Carrello persistente nel browser: quantità da 1 a 5, rimozione, riepilogo e simulazione ordine.
- Layout responsive, navigazione da tastiera, supporto alla preferenza di movimento ridotto.

Le cinque sezioni richieste più le quattro schede prodotto formano **9 pagine HTML**. Le animazioni 3D usano prospettiva e trasformazioni CSS sulle illustrazioni SVG: non sono modelli tridimensionali ruotabili a 360°.

## Aprire in Visual Studio Code

Apri l'intera cartella `aurel` con File → Apri cartella. Non servono pacchetti npm.

Anteprima statica (Node.js 18 o superiore):

```sh
npm start
```

Apri http://127.0.0.1:4173. In alternativa usa Live Server su `public/index.html`. I comandi sono disponibili anche in Terminale → Esegui attività.

## PHP e salvataggio dimostrativo

Requisiti: PHP 8.1 o superiore con PDO SQLite e sessioni abilitate.

```sh
php -S 127.0.0.1:8000 -t public
```

Apri http://127.0.0.1:8000. Il sito rileva automaticamente il backend: le richieste di contatto e gli ordini demo vengono salvati in `var/aurel.sqlite`, **fuori dalla directory pubblica**. La directory `var` deve essere scrivibile dal processo PHP. Si può impostare `AUREL_DATA_DIR` per usare un'altra cartella privata. Non pubblicare il database.

Le API verificano sessione/CSRF, formato, email, quantità e identificativi; calcolano i prezzi dal catalogo server senza fidarsi dei prezzi del browser. Le query sono parametrizzate; il limite è di 15 richieste per indirizzo IP ogni 10 minuti. Non esiste un pannello amministrativo. Per esaminare i dati di prova aprire il database localmente con un client SQLite; eliminare i dati di prova al termine delle verifiche.

In modalità statica, il modulo contatti mostra soltanto un'anteprima locale e l'ordine è una simulazione locale. Nessun dato di contatto viene memorizzato nel browser. Il carrello salva solo ID e quantità. Sono usati Google Fonts con caratteri di sistema come alternativa: rimuovere l'import CSS o ospitare i font localmente per evitare richieste a servizi esterni.

## GitHub: account marcorpn96-wq

Repository: https://github.com/marcorpn96-wq/aurel-orologi. Il repository può contenere anche PHP, ma **GitHub Pages non esegue PHP**. Il workflow incluso pubblica solo la demo statica da `public`, escludendo il codice PHP. Le vendite reali richiedono un hosting adatto e l'integrazione di un servizio pagamenti. Documentazione: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Per lavorare sul progetto già caricato:

```sh
git clone https://github.com/marcorpn96-wq/aurel-orologi.git
cd aurel-orologi
code .
npm start
```

Per caricare modifiche, salvare i file in Visual Studio Code e usare il pannello Controllo codice sorgente per creare un commit e sincronizzarlo con GitHub. Il caricamento richiede l'accesso al proprio account.

Per la demo su Pages, nel repository scegliere Settings → Pages → Source → GitHub Actions. Il workflow “Demo statica AUREL” controlla il progetto, verifica il backend PHP su un ambiente Linux e pubblica i file statici. Il link viene restituito dal workflow dopo il deployment.

## Modificare il progetto

- Aspetto: `public/assets/style.css`.
- Interazioni: `public/assets/app.js`.
- Immagini: quattro SVG originali in `public/assets/`.
- Testi: pagine HTML in `public/`.
- Catalogo: mantenere allineati `products.json` (server) e `products.js` (browser), oltre ai testi delle pagine prodotto.
- Backend: `public/api/index.php`.

Verifica rapida:

```sh
npm run check
php -l public/api/index.php
node scripts/test-api.cjs
```

## Prima di un utilizzo reale

Servono un catalogo verificato, pagamenti con verifica server e webhook, gestione disponibilità/ordini, autenticazione amministrativa, invio email, condizioni di vendita e informative riferite all'attività reale. Il progetto è una base dimostrativa e non deve essere presentato come negozio già operativo.
