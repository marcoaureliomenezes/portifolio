import { ContentData } from './types';

export const portugueseContent: ContentData = {
  resumeTitle: "Resumo",
  skillsTitle: "Habilidades", 
  experienceTitle: "Experiência Profissional",
  educationTitle: "Educação",
  certificationsTitle: "Certificações",
  seeMore: "Ver mais",
  seeLess: "Ver menos",
  responsibilities: "Responsabilidades:",
  technologies: "Tecnologias:",
  validUntil: "Válido até",
  viewCredential: "Ver credencial",
  contact: {
    email: "marcoaurelioreislima@gmail.com",
    linkedinUrl: "https://linkedin.com/in/marcoaureliomenezes",
    githubUrl: "https://github.com/marcoaureliomenezes",
  },
  nav: {
    experience: "Experiência",
    education: "Educação",
    certifications: "Certificações",
    skills: "Habilidades",
  },
  ui: {
    careerProgression: "Progressão de carreira",
    position: "cargo",
    positions: "cargos",
    issuerLabel: "Emissor:",
    viewLarger: "Ver maior",
    resumeFileLabel: "Currículo",
    emailModalTitle: "Contato por Email",
    emailSendButton: "Enviar Email",
  },
  header: {
    title: "Engenheiro de Dados Sênior | Data & AI Engineer",
    location: "Belo Horizonte, MG - Brasil",
    viewEmail: "E-mail"
  },
  resume: {
    short: "Engenheiro de Dados Sênior e Data & AI Engineer com 10+ anos de experiência em Python e forte atuação em engenharia de dados em escala. Experiência prática em Spark, SQL, Kafka, Azure, Databricks e AWS, liderando migração de pipelines batch/streaming de on-premises para cloud...",
    full: "Engenheiro de Dados Sênior e Data & AI Engineer com 10+ anos de experiência em Python e forte atuação em engenharia de dados em escala. Entrega de pipelines batch e streaming com Spark, SQL, Kafka e ecossistema Hadoop, além de migrações de plataformas on-premises para Azure + Databricks e, mais recentemente, workloads de streaming para AWS. Na F1rst/Santander, atua em iniciativas de modernização de dados e também em engenharia aplicada a IA, com participação em piloto corporativo com Devin e integração de fluxos com Windsurf. Formação em Engenharia de Controle e Automação, com foco em decisões técnicas orientadas a confiabilidade, custo, performance e evolução de produto."
  },
  skills: [
    {
      title: "Idiomas",
      icon: "🌍",
      skills: ["Português (Nativo)", "Inglês (Avançado)", "Alemão (Intermediário)"]
    },
    {
      title: "Linguagens de Programação",
      icon: "💻",
      skills: ["Python", "SQL", "Scala", "Shell Script (Bash/Linux)"]
    },
    {
      title: "Provedores Cloud",
      icon: "☁️",
      skills: ["AWS", "Azure", "Databricks"]
    },
    {
      title: "Tecnologias de Dados On-premises",
      icon: "🏗️",
      skills: ["Hadoop", "Hive", "Spark", "Kafka"]
    },
    {
      title: "Tecnologias de DevOps",
      icon: "🔧",
      skills: ["Git", "GitHub", "GitHub Actions", "Jenkins", "Docker"]
    }
  ],
  experiences: [
    {
      company: "F1rst Digital Services",
      fullName: "F1rst Digital Services - Santander Brasil",
      location: "São Paulo, SP - Brasil",
      totalPeriod: "05-2021 a Presente",
      type: "main", 
      roles: [
        {
          title: "Engenheiro de Dados Sênior",
          period: "02-2024 a Presente",
          responsibilities: [
            "Responsável por liderar a equipe de DE contábil através do movimento estratégico de Transformação de Dados",
            "Migrei pipelines de dados batch e streaming de on-premises para Azure usando Databricks, Data Factory e ADLS gen2",
            "Migrei pipelines streaming (DB2, Kafka, Spark Streaming, ScyllaDB, Openshift) para AWS (MSK, Aurora, EKS)",
            "Projetei pipelines batch diários para entregar tabelas Delta Bronze e Silver de Contabilidade para o domínio Cash Management",
            "Atuei como Data & AI Engineer em iniciativas com agentes de IA (Devin e Windsurf) para acelerar fluxos de engenharia"
          ],
          technologies: "Spark, Hadoop, Hive, Databricks, Azure Data Factory, ADLS gen2, Amazon MSK, Aurora, EKS, S3, CloudWatch"
        },
        {
          title: "Engenheiro de Dados Pleno", 
          period: "07-2022 a 02-2024",
          responsibilities: [
            "Liderei a migração para Cloud do sistema Plano de Descontinuidade Operacional, melhorando a durabilidade de tabelas Hive entre clusters",
            "Copiei tabelas Delta entre data lakes Azure com configuração de redundância de zona para reduzir custos de armazenamento",
            "Garanti governança, compliance e segurança para migrações de dados sensíveis de alto volume"
          ],
          technologies: "Python, Spark, Shell Script, Hadoop Ecosystem, Databricks, Azure Cloud"
        },
        {
          title: "Engenheiro de Dados Júnior",
          period: "05-2021 a 07-2022",
          responsibilities: [
            "Migrei jobs Hadoop e Hive on-premises para plataforma Databricks na nuvem Azure",
            "Desenvolvi pipelines Python para transformação de dados e integração com APIs REST",
            "Implementei logs estruturados e monitoramento para pipelines de dados críticos"
          ],
          technologies: "Python, Spark, Hadoop, Hive, Databricks, Azure, Shell Script"
        }
      ]
    },
    {
      company: "Trie Engineering",
      fullName: "Trie Engineering",
      location: "Remoto",
      totalPeriod: "10-2020 a 05-2021",
      type: "minor",
      roles: [
        {
          title: "Engenheiro de Dados Júnior",
          period: "10-2020 a 05-2021",
          responsibilities: [
            "Mantive pipelines ETL alimentando dashboards a partir de Google Sheets e dados de campo",
            "Forneci feeds de dados para apoiar tomada de decisão para stakeholders da indústria de cimento"
          ],
          technologies: "Python, Pandas, NumPy"
        }
      ]
    },
    {
      company: "Fire Labs - Universidade Federal de Ouro Preto",
      fullName: "Fire Labs - Universidade Federal de Ouro Preto",
      location: "Ouro Preto, MG - Brasil",
      totalPeriod: "08-2016 a 08-2017",
      type: "minor",
      roles: [
        {
          title: "Bolsista de Pesquisa",
          period: "08-2016 a 08-2017",
          responsibilities: [
            "Desenvolveu software embarcado para controle de forno a gás via sensores de temperatura e fluxo usando Arduino",
            "Implementou loops de controle em C para automação de motor AC e válvula de gás"
          ],
          technologies: "C, Arduino, Sistemas de Controle"
        }
      ]
    },
    {
      company: "Analógica Instrumentação e Controle",
      fullName: "Analógica Instrumentação e Controle",
      location: "Ouro Preto, MG - Brasil",
      totalPeriod: "01-2015 a 02-2015",
      type: "minor",
      roles: [
        {
          title: "Estagiário de Verão",
          period: "01-2015 a 02-2015",
          responsibilities: [
            "Construiu aplicação Python para extrair dados de sensores de tanques de combustível para ingestão downstream",
            "Primeira experiência profissional com Python na plataforma Raspberry PI"
          ],
          technologies: "Python, Raspberry PI"
        }
      ]
    }
  ],
  education: {
    degree: "Bacharelado em Engenharia de Controle e Automação",
    institution: "Universidade Federal de Ouro Preto, Minas Gerais, Brasil",
    period: "08/2018",
    coursework: "Disciplinas relevantes: Eletrônica, sistemas embarcados, projeto de sistemas de controle, C e Python.",
    thesis: "Trabalho de Conclusão de Curso: Análise da Dinâmica e Projeto de Controladores de Temperatura para Chuveiros Elétricos."
  },
  certifications: [
    {
      name: "AWS Data Engineer",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Dezembro 2024",
      validity: "Dezembro 2027",
      level: "Associate",
      icon: "images/badges/aws_data_engineer_associate.png",
      link: "https://www.credly.com/badges/831befd4-10d8-47db-97c7-021b3915be1f/linked_in?t=ss25e1",
      description: "Certificação avançada em engenharia de dados na AWS, cobrindo pipelines, ETL, armazenamento e análise de dados em escala. Inclui serviços como Glue, Redshift, Kinesis, EMR e Lake Formation.",
      priority: 1
    },
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Janeiro 2025",
      validity: "Janeiro 2028",
      level: "Associate",
      icon: "images/badges/aws_solutions_architect_associate.png",
      link: "https://www.credly.com/badges/3d7aeb44-78db-430f-8103-550f89660989/public_url",
      description: "Certificação em arquitetura de soluções na AWS, cobrindo design de sistemas distribuídos, alta disponibilidade, tolerância a falhas e otimização de custos. Inclui serviços como EC2, VPC, S3, RDS, Lambda e CloudFormation.",
      priority: 2
    },
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services", 
      category: "AWS",
      date: "Julho 2024",
      validity: "Julho 2027",
      level: "Foundational",
      icon: "images/badges/aws_practitioner.png",
      link: "https://www.credly.com/badges/7b3fe40d-4525-4b6b-bd1f-be2c90bfbac4/linked_in?t=seidpj",
      description: "Certificação fundamental cobrindo conceitos básicos da AWS Cloud, serviços principais, segurança, arquitetura e melhores práticas de custo.",
      priority: 3
    },
    {
      name: "AWS AI Practitioner",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Setembro 2025",
      validity: "Setembro 2028",
      level: "Foundational",
      icon: "images/ai-900.png",
      link: "#",
      description: "Certificação foundational em IA na AWS cobrindo fundamentos de IA generativa, casos de uso, segurança e boas práticas em workloads com modelos.",
      priority: 4
    },
    {
      name: "Spark Data Engineer Associate",
      issuer: "Databricks",
      category: "Databricks",
      date: "Setembro 2024",
      validity: "Setembro 2026",
      level: "Associate", 
      icon: "images/databricks_de_associate.png",
      link: "https://credentials.databricks.com/dd82d9bc-fa36-4ea2-8e27-5683c0623401#acc.IaG8HjC2",
      description: "Especialização em engenharia de dados com Apache Spark, Delta Lake e arquiteturas de dados modernas. Cobre ETL, streaming, performance tuning e governança de dados.",
      priority: 5
    },
    {
      name: "Spark Developer Associate",
      issuer: "Databricks",
      category: "Databricks",
      date: "Agosto 2024",
      validity: "Agosto 2026",
      level: "Associate",
      icon: "images/databricks_spark_dev.png",
      link: "https://credentials.databricks.com/c7fa2bce-f333-4b95-a92d-36a5921b71f8#acc.HpcOW6i5",
      description: "Certificação em desenvolvimento de aplicações Apache Spark para processamento distribuído de dados. Inclui DataFrame API, SQL, RDD e otimização de performance.",
      priority: 6
    },
    {
      name: "DP-203: Engenheiro de Dados Associado Certificado pela Microsoft: Azure",
      issuer: "Microsoft",
      category: "Azure",
      date: "Agosto 2023",
      validity: "Agosto 2025",
      level: "Associate",
      icon: "images/dp-203.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/30F1ECB9883A367D?sharingId=6EB3B3C8CB10453A",
      description: "Certificação em engenharia de dados no Azure, cobrindo Azure Data Factory, Synapse Analytics, Data Lake Storage e serviços de streaming.",
      priority: 7
    },
    {
      name: "AI-900: Microsoft Certified: Conceitos básicos da IA do Azure",
      issuer: "Microsoft",
      category: "Azure",
      date: "Junho 2024",
      validity: "Não expira",
      level: "Fundamentals",
      icon: "images/ai-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/960F73173BDB1ED7?sharingId=6EB3B3C8CB10453A",
      description: "Certificação fundamental em IA do Azure cobrindo serviços de machine learning, visão computacional, processamento de linguagem natural e IA responsável.",
      priority: 8
    },
    {
      name: "SC-900: Microsoft Certified: Conceitos básicos de segurança, conformidade e identidade",
      issuer: "Microsoft",
      category: "Azure",
      date: "Dezembro 2023",
      validity: "Não expira",
      level: "Fundamentals",
      icon: "images/sc-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/E94D2E747B825BA7?sharingId=6EB3B3C8CB10453A",
      description: "Certificação fundamental em segurança, conformidade e identidade, cobrindo Azure Active Directory, proteção de dados e governança.",
      priority: 9
    },
    {
      name: "AZ-900: Microsoft Certified: Conceitos básicos do Azure",
      issuer: "Microsoft",
      category: "Azure", 
      date: "Julho 2023",
      validity: "Não expira",
      level: "Fundamentals",
      icon: "images/az-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/597D7B171F02B812?sharingId=6EB3B3C8CB10453A",
      description: "Certificação fundamental do Microsoft Azure cobrindo conceitos de cloud computing, serviços principais e modelos de preços.",
      priority: 10
    },
    {
      name: "DP-900: Microsoft Certified: Conceitos básicos de dados do Azure",
      issuer: "Microsoft",
      category: "Azure",
      date: "Julho 2023",
      validity: "Não expira",
      level: "Fundamentals",
      icon: "images/dp-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/AE747EA0B40117F7?sharingId=6EB3B3C8CB10453A",
      description: "Certificação fundamental em dados do Azure cobrindo conceitos de banco de dados, analytics e processamento de dados na nuvem.",
      priority: 11
    },
    {
      name: "Apache Airflow Fundamentals",
      issuer: "Astronomer",
      category: "Outras",
      date: "Junho 2024",
      validity: "Junho 2026",
      level: "Fundamentals",
      icon: "images/badges/airflow_fundamentals.png",
      link: "https://www.credly.com/badges/8b32e72a-de5c-4625-9c69-6b8d6669e18d/linked_in?t=s0dqu1",
      description: "Certificação em orquestração de workflows com Apache Airflow para automação de pipelines de dados. Cobre DAGs, operadores, sensores e melhores práticas.",
      priority: 12
    },
    {
      name: "Santander Data Engineer",
      issuer: "Santander Brasil",
      category: "Data Master",
      date: "Novembro 2022",
      validity: "Não expira",
      level: "Advanced",
      icon: "images/badges/santander-dea.svg",
      link: "#",
      description: "Certificação interna avançada em engenharia de dados do Santander Brasil. Ranking top 10 após caso técnico e exame abrangendo Big Data, Cloud e arquiteturas distribuídas.",
      priority: 13
    }
  ]
};
