// Exemplo: consumir experiência profissional via API Gateway
// Substitua a URL abaixo pela URL real do seu API Gateway
fetch('https://api-id.execute-api.us-east-1.amazonaws.com/prod/experiences')
  .then(res => res.json())
  .then(data => {
    const expList = document.getElementById('exp-list');
    data.forEach(exp => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${exp.title}</strong> - ${exp.company} <br>${exp.period}<br>${exp.description}<br><br>`;
      expList.appendChild(div);
    });
  })
  .catch(() => {
    // fallback estático
    document.getElementById('exp-list').innerHTML = `
      <div><strong>Senior Data Engineer</strong> - F1rst Digital Services – Santander Brazil <br>02/2024 to Present<br>Migração de pipelines para cloud, arquitetura Data Mesh, etc.<br><br></div>
      <div><strong>Mid-level Data Engineer</strong> - F1rst Digital Services – Santander Brazil <br>07/2022 to 02/2024<br>Cloud migration, governança, compliance.<br><br></div>
      <div><strong>Junior Data Engineer</strong> - F1rst Digital Services – Santander Brazil <br>05/2021 to 07/2022<br>Big data workloads, reporting, compliance.<br><br></div>
      <div><strong>Junior Data Engineer</strong> - Trie Engineering <br>10/2020 to 05/2021<br>Dashboards, Google Sheets, Pandas.<br><br></div>
    `;
  });

// Exemplo: enviar contato via API Gateway
document.getElementById('contact-form').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const result = document.getElementById('contact-result');
  const payload = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  try {
    const res = await fetch('https://api-id.execute-api.us-east-1.amazonaws.com/prod/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      result.textContent = 'Mensagem enviada com sucesso!';
      form.reset();
    } else {
      result.textContent = 'Erro ao enviar mensagem.';
    }
  } catch {
    result.textContent = 'Erro ao enviar mensagem.';
  }
};

// Toggle resumo expandido
const toggleSummaryBtn = document.getElementById('toggle-summary');
const summaryContent = document.querySelector('.summary-content');
if (toggleSummaryBtn && summaryContent) {
  toggleSummaryBtn.addEventListener('click', () => {
    const isExpanded = summaryContent.classList.toggle('expanded');
    summaryContent.classList.toggle('clamp', !isExpanded);
    toggleSummaryBtn.textContent = isExpanded ? 'Ver menos' : 'Ver mais';
  });
}

// Language switching functionality
const translations = {
  pt: {
    'nav.summary': 'Resumo',
    'nav.skills': 'Habilidades',
    'nav.experience': 'Experiência',
    'nav.projects': 'Projetos',
    'nav.certificates': 'Certificações',
    'nav.download': 'Baixar CV',
    'section.summary': 'Resumo',
    'section.skills': 'Habilidades',
    'section.experience': 'Experiência Profissional',
    'section.projects': 'Projetos Pessoais',
    'section.certificates': 'Certificações',
    'section.contact': 'Contato',
    'button.readMore': 'Ver mais',
    'button.readLess': 'Ver menos'
  },
  en: {
    'nav.summary': 'Summary',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.certificates': 'Certificates',
    'nav.download': 'Download CV',
    'section.summary': 'Summary',
    'section.skills': 'Skills',
    'section.experience': 'Professional Experience',
    'section.projects': 'Personal Projects',
    'section.certificates': 'Certificates',
    'section.contact': 'Contact',
    'button.readMore': 'Read more',
    'button.readLess': 'Read less'
  }
};
let currentLang = 'pt';

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key === 'button.readMore') {
      const isExpanded = summaryContent.classList.contains('expanded');
      el.textContent = translations[currentLang][isExpanded ? 'button.readLess' : 'button.readMore'];
    } else {
      el.textContent = translations[currentLang][key] || el.textContent;
    }
  });
}

// Language selection via select dropdown
const langSelect = document.getElementById('lang-select');
langSelect.value = currentLang;
langSelect.addEventListener('change', () => {
  currentLang = langSelect.value;
  applyTranslations();
});

// Initialize translations on load
applyTranslations();
