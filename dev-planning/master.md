Aiutami a scrivere un piano per ogni paragrafo, in diversi file in dev-planning che mettano in ordine i dettagli delle implementazioni e i task, mantenendo sempre come riferimenti globali per tutti i piani src\lib\supabase\database.types.ts src\lib\supabase\queries.ts

A. GESTIONE TEAMS
Riferimenti specifici: src\app\page.tsx src\components\navigation\header.tsx src\components\navigation\user-menu.tsx src\app\@admin\teams\components\teams-table.tsx src\app\@admin\teams\components\teams-view.tsx
1- creare una nuova pagina nel menù utente, di fianco al profilo, nella barra in alto chiamata "Teams" per visualizzare e modificare i team di cui fa parte l'utente (tramite user_teams)
2- cliccando su ogni team nellapagina, creare la possibilità di impostare con quali altri team è connesso connessa con la nuova tabella in Supabase team_teams (first_team è sempre quello che viene prima nell'alfabeto, second_team deve essere quello che vienen dopo nell'alfabeto)
3 - nella parte Admin, aggiornare la pagina /admin/teams per gestire queste nuove connessioni

B. GESTIONE PROCESSI
Riferimenti specifici: src\app\page.tsx src\components\navigation\header.tsx src\components\navigation\user-menu.tsx src\app\@admin\processes\components\processes-view.tsx src\app\@admin\processes\components\processes-table.tsx
1- creare una nuova pagina per l'utente nella barra in alto "Processes" per impostare i processi collegati ai team
2- connettere la nuova tabella team_processes di Supabase a questa nuova pagina "Processes" per impostare la connessione tra team e processi nella pagina "Processes"
3- filtrare nella pagina "Processes" solo i team connessi all'utente (tramite user_teams) dando la possibilità ad ogni utente di gestire i processi dei team di cui fa parte
4 - dare la possibilità di assegnare ad ogni processo uno o più persone del team, aggiornando la tabella user_processes in Supabase

C. SICUREZZA PATH ADMIN
Riferimenti specifici: src\app\@admin src\app\(routes) src\app\(auth)
1- mettere in sicurezza il path /admin/ con una password hardcoded

D. UTILIZZO TAG
Riferimenti specifici: src\app\session\[id]\evaluate\page.tsx src\app\session\[id]\page.tsx
1- far comparire i tag corretti in base alla combinazione tra question_id e score per consigliare il contenuto del commento all'utente in fase di valutazione seleziona uno score
2- se cliccata, la question_tags.description viene copiata all'interno dell'input dei commenti nella UI (che poi, una volta salvata, riempirà il feedbacks.comment)
3- inserire obbligatorietà del commento per salvare il propro feedbacks.value

E. SESSION RESULTS - PAGINA FEEDBACK
Riferimenti specifici: src\app\session_results\feedback\page.tsx src\app\session_results\page.tsx
1- Nel dettaglio della sessione, non si dovrebbero visualizzare i valori "Overall, Il mio Mentor e Self" complessivi della sessione da user_sessions,ma i count specifici per ogni questions_description (session_results/feedback?userId=10f7689e-9748-461f-8b65-c19477a15041&userName=Eleonora+Coppola&sessionId=2cda5421-65a9-4763-8377-b5db518737fa&skill=Execution+Skills)
2- nel dettaglio della sessione, assicurarsi che non ci siano valori hardcodati come ad esempio la data di effettuazione della sessione
3 - assicurarsi di poter visualizzare le diverse domande, perché in questo momento se ne può vedere solo una per ogni questions.type
4- migliorare la UI dei valori Overall, il mio Mentor e Self all'interno di ogni pagina feedback della domanda

F. SESSION RESULTS - PAGINA COMMENTI
Riferimenti specifici: src\app\session_results\comment\page.tsx
1- assicurarsi che i commenti visualizzati siano quelli relativi alla specifica domanda e che tornando indietro l'utente torni alla domanda di partenza
2 - togliere il dropdown con il type di riferimento e toglierlo anche dall'url (ad esempio &skill=Strategy%20Skills), basta il riferimento alla specifica domanda
2- nella pagina dei commenti ricevuti, se sono tanti, non si riesce a vedere il bottone in fondo per tornare indietro perché la UI non scrolla fino in fondo session_results/comment?sessionId=2cda5421-65a9-4763-8377-b5db518737fa&userId=9c77785a-f6d3-43e0-bb08-df361ffe836d&skill=Strategy%20Skills

G. SESSSION RESULTS - CREAZIONE INIZIATIVE
1- far funzionare il tasto "Crea iniziativa" aprendo una pagina (non so se già esiste) per generare una initiative nella tabella initiatives con tutti i dati necessari

H. ELIMINAZIONE DATI MOCK
1- Cercare tutti i file e i dati mock in applicazione (come per esempio src\lib\data\mock-people.ts)
2 - Eliminarli mantenendo l'applicativo funzionante
