// =====================================================
// MAIN.JS - FUNCIONALIDADES PRINCIPAIS DO PORTFÓLIO
// =====================================================

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
    'header.name': 'Marco Aurelio Menezes',
    'header.title': 'Engenheiro de Dados | Especialista em Nuvem',
    'header.location': 'Belo Horizonte, MG - Brasil',
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
    'header.name': 'Marco Aurelio Menezes',
    'header.title': 'Data Engineer | Cloud Specialist',
    'header.location': 'Belo Horizonte, MG - Brazil',
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
  // Atualizar elementos com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key === 'button.readMore') {
      const isExpanded = summaryContent.classList.contains('expanded');
      el.textContent = translations[currentLang][isExpanded ? 'button.readLess' : 'button.readMore'];
    } else {
      el.textContent = translations[currentLang][key] || el.textContent;
    }
  });
  
  // Atualizar título da página
  const pageTitles = {
    pt: 'Marco Menezes | Engenheiro de Dados Cloud',
    en: 'Marco Menezes | Cloud Data Engineer'
  };
  document.title = pageTitles[currentLang];
  
  // Atualizar meta description
  const metaDescriptions = {
    pt: 'Portfólio de Marco Menezes - Engenheiro de Dados especializado em soluções cloud',
    en: 'Marco Menezes Portfolio - Data Engineer specialized in cloud solutions'
  };
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = metaDescriptions[currentLang];
  }
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

// Mobile menu functionality
const menuToggle = document.getElementById('menu-toggle');
const sidebarNav = document.getElementById('sidebar-nav');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleMobileMenu() {
  sidebarNav.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
  document.body.style.overflow = sidebarNav.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
  sidebarNav.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMobileMenu);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeMobileMenu);
}

// Close menu when clicking on sidebar links
document.querySelectorAll('.sidebar-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      closeMobileMenu();
    }
  });
});

// Close menu on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    closeMobileMenu();
  }
});

// CV Download functionality
async function downloadCV() {
  try {
    // Opção 1: Download de arquivo estático local/S3
    const link = document.createElement('a');
    link.href = './assets/marco_menezes_resume.pdf'; // Caminho relativo para S3
    link.download = 'Marco_Menezes_Resume.pdf';
    link.target = '_blank'; // Abrir em nova aba como fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    /* 
    // Opção 2: Download via API (descomente quando tiver o backend)
    const response = await fetch('https://api-id.execute-api.us-east-1.amazonaws.com/prod/resume');
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Marco_Menezes_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Erro ao baixar CV');
    }
    */
  } catch (error) {
    console.error('Erro no download:', error);
    // Fallback: abrir em nova aba se download falhar
    window.open('./assets/marco_menezes_resume.pdf', '_blank');
  }
}

// Adicionar event listener para o botão flutuante
document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('btn-download-float');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      downloadCV();
    });
  }
});

// =====================================================
// CARREGAMENTO DE VARIÁVEIS DO JSON
// =====================================================

/**
 * Carrega variáveis do arquivo variables.json
 * Pode ser usado para substituir as traduções hardcoded futuramente
 */
async function loadVariables() {
  try {
    const response = await fetch('./data/variables.json');
    const variables = await response.json();
    console.log('📋 Variáveis carregadas:', variables);
    
    // Opcional: atualizar elementos do header com dados do JSON
    // updateHeaderFromJSON(variables.header);
    
    return variables;
  } catch (error) {
    console.warn('⚠️ Erro ao carregar variables.json:', error);
    console.log('📋 Usando traduções hardcoded como fallback');
    return null;
  }
}

/**
 * Atualiza header com dados do JSON (função de exemplo)
 * Descomente para usar dados dinâmicos do JSON
 */
/*
function updateHeaderFromJSON(headerData) {
  const nameEl = document.querySelector('[data-i18n="header.name"]');
  const titleEl = document.querySelector('[data-i18n="header.title"]');
  const locationEl = document.querySelector('[data-i18n="header.location"]');
  
  if (nameEl) nameEl.textContent = headerData.name;
  if (titleEl) titleEl.textContent = headerData.title[currentLang];
  if (locationEl) locationEl.textContent = headerData.location[currentLang];
}
*/

// Carregar variáveis na inicialização (opcional)
// loadVariables().then(variables => {
//   console.log('✅ Sistema de variáveis inicializado');
// });
