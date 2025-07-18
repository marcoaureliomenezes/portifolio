// =====================================================
// CARREGAMENTO E RENDERIZAÇÃO DE EXPERIÊNCIAS
// =====================================================

let experiencesTranslations = {};

// Função para carregar traduções
async function loadExperiencesTranslations() {
  try {
    const response = await fetch('./data/variables.json');
    if (response.ok) {
      const data = await response.json();
      experiencesTranslations = data.experiences || {};
    }
  } catch (error) {
    console.warn('Erro ao carregar traduções de experiências:', error);
  }
}

// Função para carregar e renderizar experiências profissionais
async function loadExperiences() {
  console.log('🚀 Iniciando carregamento de experiências...');
  
  try {
    // Carregar traduções primeiro
    await loadExperiencesTranslations();
    
    // Buscar dados de experiências
    console.log('📡 Fazendo fetch para ./data/experiences.json');
    const response = await fetch('./data/experiences.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dados carregados:', data);
    
    // Detectar idioma atual (padrão: português)
    const currentLang = document.documentElement.lang || 'pt';
    const langCode = currentLang.includes('pt') ? 'pt' : 'en';
    const experiences = data.experiences[langCode] || data.experiences.pt;
    
    console.log(`🌍 Idioma detectado: ${langCode}, experiências:`, experiences);
    
    // Renderizar experiências
    renderExperiences(experiences, langCode);
    
  } catch (error) {
    console.error('❌ Erro ao carregar experiências:', error);
    // Fallback para dados estáticos em caso de erro
    renderFallbackExperiences();
  }
}

// Função para renderizar experiências
function renderExperiences(experiences, langCode = 'pt') {
  console.log('🎨 Iniciando renderização de experiências...');
  
  const experienceList = document.querySelector('.experience-list');
  
  if (!experienceList) {
    console.error('❌ Container de experiências não encontrado (.experience-list)');
    return;
  }
  
  console.log(`📋 Container encontrado, renderizando ${experiences.length} empresas...`);
  
  // Limpar conteúdo existente
  experienceList.innerHTML = '';
  
  // Renderizar cada empresa
  experiences.forEach((company, index) => {
    console.log(`🏢 Renderizando empresa ${index + 1}: ${company.company}`);
    const companyElement = createCompanyElement(company, langCode);
    experienceList.appendChild(companyElement);
  });
  
  console.log('✅ Renderização concluída!');
}

// Função para criar elemento de empresa
function createCompanyElement(company, langCode = 'pt') {
  const details = document.createElement('details');
  details.className = `experience-item ${company.type}`;
  
  // Criar summary (cabeçalho)
  const summary = document.createElement('summary');
  
  // Para empresas principais (type: "main") - estrutura hierárquica
  if (company.type === 'main') {
    const summaryContent = document.createElement('div');
    summaryContent.className = 'experience-header';
    
    // Período total à esquerda
    const periodElement = document.createElement('div');
    periodElement.className = 'total-period';
    periodElement.textContent = company.totalPeriod;
    
    // Informações da empresa à direita
    const companyInfo = document.createElement('div');
    companyInfo.className = 'company-info';
    
    const companyName = document.createElement('div');
    companyName.className = 'company-name';
    companyName.textContent = company.company;
    
    const companyFull = document.createElement('div');
    companyFull.className = 'company-full';
    companyFull.textContent = company.fullName;
    
    const location = document.createElement('div');
    location.className = 'company-location';
    location.textContent = company.location;
    
    companyInfo.appendChild(companyName);
    companyInfo.appendChild(companyFull);
    companyInfo.appendChild(location);
    
    summaryContent.appendChild(periodElement);
    summaryContent.appendChild(companyInfo);
    summary.appendChild(summaryContent);
    
    // Adicionar summary primeiro
    details.appendChild(summary);
    
    // Adicionar lista de cargos (expandível)
    const rolesContainer = document.createElement('div');
    rolesContainer.className = 'roles-container';
    
    company.roles.forEach(role => {
      const roleElement = createRoleElement(role, langCode);
      rolesContainer.appendChild(roleElement);
    });
    
    details.appendChild(rolesContainer);
    
  } else {
    // Para experiências menores (type: "minor") - estrutura simples
    const role = company.roles[0]; // Assumindo apenas um cargo
    
    const summaryContent = document.createElement('div');
    summaryContent.className = 'experience-header simple';
    
    const periodElement = document.createElement('div');
    periodElement.className = 'total-period';
    periodElement.textContent = company.totalPeriod;
    
    const simpleInfo = document.createElement('div');
    simpleInfo.className = 'simple-info';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'job-title';
    titleElement.textContent = role.title;
    
    const companyElement = document.createElement('div');
    companyElement.className = 'company-name';
    companyElement.textContent = company.company;
    
    const locationElement = document.createElement('div');
    locationElement.className = 'company-location';
    locationElement.textContent = company.location;
    
    simpleInfo.appendChild(titleElement);
    simpleInfo.appendChild(companyElement);
    simpleInfo.appendChild(locationElement);
    
    summaryContent.appendChild(periodElement);
    summaryContent.appendChild(simpleInfo);
    summary.appendChild(summaryContent);
    
    // Adicionar summary primeiro
    details.appendChild(summary);
    
    // Adicionar responsabilidades diretamente
    const ul = document.createElement('ul');
    ul.className = 'responsibilities';
    role.responsibilities.forEach(responsibility => {
      const li = document.createElement('li');
      li.textContent = responsibility;
      ul.appendChild(li);
    });
    details.appendChild(ul);
    
    // Adicionar tecnologias se existir
    if (role.technologies) {
      const techP = document.createElement('p');
      techP.className = 'technologies';
      const techLabel = experiencesTranslations.technologies?.[langCode] || 'Tecnologias:';
      techP.innerHTML = `<strong>${techLabel}</strong> ${role.technologies}`;
      details.appendChild(techP);
    }
  }
  
  return details;
}

// Função para criar elemento de cargo (para empresas principais)
function createRoleElement(role, langCode = 'pt') {
  const roleDiv = document.createElement('div');
  roleDiv.className = 'role-item';
  
  // Header do cargo
  const roleHeader = document.createElement('div');
  roleHeader.className = 'role-header';
  
  const jobTitle = document.createElement('div');
  jobTitle.className = 'job-title';
  jobTitle.textContent = role.title;
  
  const jobDate = document.createElement('div');
  jobDate.className = 'job-period';
  jobDate.textContent = role.period;
  
  roleHeader.appendChild(jobTitle);
  roleHeader.appendChild(jobDate);
  roleDiv.appendChild(roleHeader);
  
  // Lista de responsabilidades
  const ul = document.createElement('ul');
  ul.className = 'responsibilities';
  role.responsibilities.forEach(responsibility => {
    const li = document.createElement('li');
    li.textContent = responsibility;
    ul.appendChild(li);
  });
  roleDiv.appendChild(ul);
  
  // Tecnologias
  if (role.technologies) {
    const techP = document.createElement('p');
    techP.className = 'technologies';
    const techLabel = experiencesTranslations.technologies?.[langCode] || 'Tecnologias:';
    techP.innerHTML = `<strong>${techLabel}</strong> ${role.technologies}`;
    roleDiv.appendChild(techP);
  }
  
  return roleDiv;
}

// Função fallback para dados estáticos
function renderFallbackExperiences() {
  console.log('Usando dados estáticos de fallback');
  // Manter a estrutura HTML atual como fallback
}

// Carregar experiências quando a página carregar
document.addEventListener('DOMContentLoaded', loadExperiences);

// Recarregar experiências quando o idioma mudar
document.addEventListener('languageChanged', loadExperiences);
