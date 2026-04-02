const events = [
    {year:1949, name:"First Soviet nuclear test",     type:"test",     desc:"RDS-1 detonated at Semipalatinsk."},
    {year:1953, name:"Soviet hydrogen bomb test",     type:"test",     desc:"RDS-6s thermonuclear device. 400 kt yield."},
    {year:1957, name:"Mayak nuclear accident",        type:"incident", desc:"Explosion at Ozersk. Contaminated 20,000 km²."},
    {year:1961, name:"Tsar Bomba detonation",         type:"test",     desc:"Largest nuclear weapon ever tested. 50 Mt yield."},
    {year:1962, name:"Cuban Missile Crisis",          type:"doctrine", desc:"USSR deployed missiles to Cuba."},
    {year:1968, name:"NPT signed by USSR",            type:"treaty",   desc:"Non-Proliferation Treaty signed."},
    {year:1972, name:"SALT I Agreement",              type:"treaty",   desc:"First arms control agreement."},
    {year:1986, name:"Chernobyl disaster",            type:"incident", desc:"Reactor 4 explosion at Chernobyl NPP."},
    {year:1991, name:"START I signed",                type:"treaty",   desc:"Strategic Arms Reduction Treaty."},
    {year:2010, name:"New START signed",              type:"treaty",   desc:"Further reductions in strategic warheads."},
    {year:2022, name:"Nuclear threats — Ukraine war", type:"doctrine", desc:"Putin issues nuclear warnings."},
    {year:2023, name:"New START suspended",           type:"treaty",   desc:"Russia suspends New START treaty."},
];

const typeColor = {
    test:"type-test", doctrine:"type-doctrine",
    incident:"type-incident", treaty:"type-treaty",
    deploy:"type-deploy"
};
const typeLabel = {
    test:"TEST", doctrine:"DOCTRINE",
    incident:"INCIDENT", treaty:"TREATY",
    deploy:"DEPLOY"
};
// განაახლებს ტექსტს; იძახებს renderEventList()-ს არჩეული წლით
function updateTimeline(val) {
    document.getElementById('tl-range').textContent = `1945 – ${val}`;
    renderEventList(parseInt(val));
}
/*
filter() — ფილტრავს მხოლოდ იმ მოვლენებს, რომლებიც არჩეულ წელს ან ადრეა
slice() — ქმნის კოპიას (რომ ორიგინალი მასივი არ შეიცვალოს)
reverse() — ახლიდან ძველისკენ ალაგებს
*/
function renderEventList(year) {
    const list = document.getElementById('event-list');
    const visible = events.filter(e => e.year <= year).slice().reverse();
    if (visible.length === 0) {
        list.innerHTML = '<p style="color:#aaa;font-size:12px;padding:8px">No events before this year.</p>';
        return;
    }

    // თითოეული მოვლენისთვის გენერირდება HTML
    list.innerHTML = visible.map(e => `
        <div class="event-card">
            <div class="ev-header">
                <div class="ev-name">${e.name}</div>
                <div class="ev-year">${e.year}</div>
            </div>
            <span class="ev-type ${typeColor[e.type]}">${typeLabel[e.type]}</span>
            <div class="ev-desc">${e.desc}</div>
        </div>
    `).join('');
}
renderEventList(2024);
// AI ANALYST-ის TAB-ზე გადასვლა  
function switchTab(tab) {
    const eventList = document.getElementById('event-list');
    const aiPanel   = document.getElementById('ai-panel');
    const tabEvents = document.getElementById('tab-events');
    const tabAi     = document.getElementById('tab-ai');

    if (tab === 'events') {
        eventList.style.display = 'block';
        aiPanel.style.display   = 'none';
        tabEvents.classList.add('active');
        tabAi.classList.remove('active');
    } else {
        eventList.style.display = 'none';
        aiPanel.style.display   = 'flex';
        tabEvents.classList.remove('active');
        tabAi.classList.add('active');
    }
}

async function askAI(quickQuery) {
    const input = document.getElementById('ai-input');
    const question = quickQuery || input.value.trim();
    if (!question) return;
    input.value = '';

    const messages = document.getElementById('ai-messages');

    // მომხმარებლის შეტყობინება
    messages.innerHTML += `<div class="msg user-msg">${question}</div>`;

    // loading
    const loadId = 'load-' + Date.now();
    messages.innerHTML += `<div class="msg ai-msg" id="${loadId}">...</div>`;
    messages.scrollTop = messages.scrollHeight;

    const context = `You are an AI analyst for RNDP (Russian Nuclear Threat Data Program). 
You have access to these historical events: ${JSON.stringify(events)}.
Answer concisely and analytically. Focus on nuclear threat analysis.`;

    try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                system: context,
                messages: [{ role: "user", content: question }]
            })
        });
        const data = await res.json();
        const answer = data.content?.[0]?.text || "No response.";
        document.getElementById(loadId).textContent = answer;
    } catch(e) {
        document.getElementById(loadId).textContent = "Error connecting to AI.";
    }
    messages.scrollTop = messages.scrollHeight;
}