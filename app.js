// Utilities
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => io.observe(el));

// Jump buttons
["jumpScanner","jumpScanner2","jumpScanner3"].forEach(id=>{
  $("#"+id)?.addEventListener("click",()=>$("#scanner").scrollIntoView({behavior:"smooth"}));
});

// Scanner logic
const input = $("#promptInput");
const findingsEl = $("#findings");
const badge = $("#riskBadge");
const policyOut = $("#policyOutput");

const suspiciousPatterns = [
  /ignore previous instructions/i,
  /reveal .*system prompt/i,
  /bypass .*safeguard/i,
  /disable .*safety/i
];

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phoneRegex = /\+?\d[\d\s-]{8,}\d/;

function scan(text){
  const findings = [];
  let risk = "low";

  suspiciousPatterns.forEach(p=>{
    if(p.test(text)){
      findings.push("Potential prompt injection attempt detected.");
      risk = "high";
    }
  });

  if(emailRegex.test(text) || phoneRegex.test(text)){
    findings.push("Sensitive personal data detected.");
    if(risk !== "high") risk = "medium";
  }

  if(!findings.length){
    findings.push("No obvious security issues detected.");
  }

  return { findings, risk };
}

function setBadge(level){
  badge.className = "badge " + level;
  badge.textContent = "Risk: " + level.toUpperCase();
}

$("#scanBtn").onclick = () => {
  findingsEl.innerHTML = "";
  policyOut.textContent = "";
  const { findings, risk } = scan(input.value);
  setBadge(risk);
  findings.forEach(f=>{
    const li = document.createElement("li");
    li.textContent = f;
    findingsEl.appendChild(li);
  });
};

$("#redactBtn").onclick = () => {
  input.value = input.value
    .replace(emailRegex,"[REDACTED_EMAIL]")
    .replace(phoneRegex,"[REDACTED_PHONE]");
  toast("PII redacted");
};

$("#policyBtn").onclick = () => {
  const { risk } = scan(input.value);
  policyOut.textContent =
`recommended_policy:
  risk_level: ${risk}
  actions:
    - scan_prompts: true
    - redact_pii: true
    - log_events: true
    - block_on_high_risk: ${risk==="high"}`;
};

$$(".chip").forEach(c=>{
  c.onclick=()=>input.value=c.dataset.sample;
});

// Copy buttons
$$(".copyBtn").forEach(btn=>{
  btn.onclick=()=>{
    const code = btn.closest(".codecard").querySelector("code").innerText;
    navigator.clipboard.writeText(code);
    toast("Copied!");
  };
});

// Accordion
$$(".acc").forEach(acc=>{
  const btn = acc.querySelector(".acc__btn");
  const panel = acc.querySelector(".acc__panel");
  btn.onclick=()=>{
    const open = acc.classList.toggle("open");
    panel.style.maxHeight = open ? panel.scrollHeight+"px" : "0";
  };
});

// Toast
const toastEl = $("#toast");
let toastTimer;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.style.opacity=0,2000);
}

// Animate score meter
setTimeout(()=>{
  $("#meterFill").style.width = "72%";
},300);
