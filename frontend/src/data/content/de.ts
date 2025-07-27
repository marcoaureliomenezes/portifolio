import { ContentData } from './types';

export const germanContent: ContentData = {
  resumeTitle: "Zusammenfassung",
  skillsTitle: "Fähigkeiten",
  experienceTitle: "Berufserfahrung",
  educationTitle: "Ausbildung", 
  certificationsTitle: "Zertifizierungen",
  seeMore: "Mehr anzeigen",
  seeLess: "Weniger anzeigen",
  responsibilities: "Verantwortlichkeiten:",
  technologies: "Technologien:",
  validUntil: "Gültig bis",
  viewCredential: "Zertifikat anzeigen",
  header: {
    title: "Dateningenieur | Cloud-Spezialist",
    location: "Belo Horizonte, MG - Brasilien",
    viewEmail: "E-Mail anzeigen"
  },
  resume: {
    short: "Senior Data Engineer mit über 8 Jahren Erfahrung in Python, 4 Jahre Berufserfahrung im Design und der Implementierung von Datenpipelines für Big Data-Workloads unter Verwendung von Python, Spark, Hadoop-Ökosystem und SQL für Validierungen. Über 2 Jahre Migration von Datenpipelines und Systemen von On-Premises zu Cloud - Azure + Databricks. Seit diesem Jahr verantwortlich für die Migration von Accounting-Streaming-Datenpipelines zu AWS...",
    full: "Senior Data Engineer mit über 8 Jahren Erfahrung in Python, 4 Jahre Berufserfahrung im Design und der Implementierung von Datenpipelines für Big Data-Workloads unter Verwendung von Python, Spark, Hadoop-Ökosystem und SQL für Validierungen. Über 2 Jahre Migration von Datenpipelines und Systemen von On-Premises zu Cloud - Azure + Databricks. Seit diesem Jahr verantwortlich für die Migration von Accounting-Streaming-Datenpipelines zu AWS. Hintergrund in Steuerungs- und Automatisierungstechnik. Anerkannt für Expertise in Python, Spark und Big Data-Grundlagen mit Leidenschaft für Wissensaustausch. Bewährte Fähigkeit, DE-Konzepte mit neuen Tools und Frameworks zu integrieren, während sich die Technologie weiterentwickelt, immer unter Berücksichtigung von Zweck, Leistung, Kosten und anderen Trade-offs."
  },
  skills: [
    {
      title: "Sprachen",
      icon: "🌍",
      skills: ["Portugiesisch (Muttersprache)", "Englisch (Fortgeschritten)", "Deutsch (Grundkenntnisse)"]
    },
    {
      title: "Programmiersprachen",
      icon: "💻",
      skills: ["Python", "SQL", "Scala", "Java"]
    },
    {
      title: "Cloud-Anbieter",
      icon: "☁️",
      skills: ["AWS", "Azure", "Databricks"]
    },
    {
      title: "On-Premises Datentechnologien",
      icon: "🏗️",
      skills: ["Hadoop", "Hive", "Spark", "Kafka"]
    },
    {
      title: "DevOps-Technologien",
      icon: "🔧",
      skills: ["Git", "GitHub", "GitHub Actions", "Jenkins", "Docker"]
    }
  ],
  experiences: [
    {
      company: "F1rst Digital Services",
      fullName: "F1rst Digital Services - Santander Brasil",
      location: "São Paulo, SP - Brasilien",
      totalPeriod: "05/2021 bis Heute",
      type: "main",
      roles: [
        {
          title: "Senior Data Engineer",
          period: "02/2024 bis Heute",
          responsibilities: [
            "Verantwortlich für die Führung des DE-Accounting-Teams durch die strategische Datentransformation",
            "Migration von Batch- und Streaming-Datenpipelines von On-Premises zu Azure mit Databricks, Data Factory und ADLS gen2",
            "Migration von Streaming-Pipelines (DB2, Kafka, Spark Streaming, ScyllaDB, Openshift) zu AWS (MSK, Aurora, EKS)",
            "Design täglicher Batch-Pipelines zur Bereitstellung von Bronze- und Silver-Accounting-Delta-Tabellen für die Cash Management-Domäne"
          ],
          technologies: "Spark, Hadoop, Hive, Databricks, Azure Data Factory, ADLS gen2, Amazon MSK, Aurora, EKS, S3, CloudWatch"
        },
        {
          title: "Data Engineer",
          period: "07/2022 bis 02/2024",
          responsibilities: [
            "Leitete die Cloud-Migration für das Operational Discontinuity Plan-System und verbesserte die Haltbarkeit von Hive-Tabellen über Cluster hinweg",
            "Kopierte Delta-Tabellen zwischen Azure Data Lakes mit zonenredundanter Konfiguration zur Reduzierung der Speicherkosten",
            "Stellte Governance, Compliance und Sicherheit für hochvolumige sensible Datenmigrationen sicher"
          ],
          technologies: "Python, Spark, Shell Script, Hadoop-Ökosystem, Databricks, Azure Cloud"
        },
        {
          title: "Junior Data Engineer",
          period: "05/2021 bis 07/2022",
          responsibilities: [
            "Migration von On-Premises Hadoop- und Hive-Jobs zur Databricks-Plattform in der Azure Cloud",
            "Entwicklung von Python-Pipelines für Datentransformation und REST-API-Integration",
            "Implementierung strukturierter Protokollierung und Überwachung für kritische Datenpipelines"
          ],
          technologies: "Python, Spark, Hadoop, Hive, Databricks, Azure, Shell Script"
        }
      ]
    },
    {
      company: "Trie Engineering",
      fullName: "Trie Engineering",
      location: "Remote",
      totalPeriod: "10/2020 bis 05/2021",
      type: "minor",
      roles: [
        {
          title: "Junior Data Engineer",
          period: "10/2020 bis 05/2021",
          responsibilities: [
            "Wartung von ETL-Pipelines, die Dashboards aus Google Sheets und Felddaten speisten",
            "Bereitstellung von Datenfeeds zur Unterstützung der Entscheidungsfindung für Stakeholder der Zementindustrie"
          ],
          technologies: "Python, Pandas, NumPy"
        }
      ]
    },
    {
      company: "Fire Labs - Bundesuniversität Ouro Preto",
      fullName: "Fire Labs - Bundesuniversität Ouro Preto",
      location: "Ouro Preto, MG - Brasilien",
      totalPeriod: "08/2016 bis 08/2017",
      type: "minor",
      roles: [
        {
          title: "Stipendiat",
          period: "08/2016 bis 08/2017",
          responsibilities: [
            "Entwicklung eingebetteter Software für Gasofensteuerung über Temperatur- und Durchflusssensoren mit Arduino",
            "Implementierung von Regelkreisen in C für AC-Motor- und Gasventilautomatisierung"
          ],
          technologies: "C, Arduino, Steuerungssysteme"
        }
      ]
    },
    {
      company: "Analógica Instrumentation and Control",
      fullName: "Analógica Instrumentation and Control",
      location: "Ouro Preto, MG - Brasilien",
      totalPeriod: "01/2015 bis 02/2015",
      type: "minor",
      roles: [
        {
          title: "Sommerpraktikant",
          period: "01/2015 bis 02/2015",
          responsibilities: [
            "Entwicklung einer Python-Anwendung zur Extraktion von Sensordaten aus Kraftstofftanks für nachgelagerte Aufnahme",
            "Erste berufliche Erfahrung mit Python auf Raspberry PI-Plattform"
          ],
          technologies: "Python, Raspberry PI"
        }
      ]
    }
  ],
  education: {
    degree: "Bachelor in Steuerungs- und Automatisierungstechnik",
    institution: "Bundesuniversität Ouro Preto, Minas Gerais, Brasilien",
    period: "08/2018",
    coursework: "Relevante Kurse: Elektronik, eingebettete Systeme, Steuerungssystemdesign, C und Python.",
    thesis: "Bachelorarbeit: Analyse der Dynamik und Design von Temperaturreglern für elektrische Duschen."
  },
  certifications: [
    {
      name: "AWS Data Engineer",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Dezember 2024",
      validity: "Dezember 2027",
      level: "Associate",
      icon: "images/badges/aws_data_engineer_associate.png",
      link: "https://www.credly.com/badges/831befd4-10d8-47db-97c7-021b3915be1f/linked_in?t=ss25e1",
      description: "Fortgeschrittene AWS-Datentechnik-Zertifizierung mit Pipelines, ETL, Speicherung und Datenanalyse im großen Maßstab. Umfasst Services wie Glue, Redshift, Kinesis, EMR und Lake Formation.",
      priority: 1
    },
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Januar 2025",
      validity: "Januar 2028",
      level: "Associate",
      icon: "images/badges/aws_solutions_architect_associate.png",
      link: "https://www.credly.com/badges/3d7aeb44-78db-430f-8103-550f89660989/public_url",
      description: "Zertifizierung in AWS-Lösungsarchitektur mit Design verteilter Systeme, hoher Verfügbarkeit, Fehlertoleranz und Kostenoptimierung. Umfasst Services wie EC2, VPC, S3, RDS, Lambda und CloudFormation.",
      priority: 2
    },
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "Juli 2024",
      validity: "Juli 2027",
      level: "Foundational",
      icon: "images/badges/aws_practitioner.png",
      link: "https://www.credly.com/badges/7b3fe40d-4525-4b6b-bd1f-be2c90bfbac4/linked_in?t=seidpj",
      description: "Grundlagenzertifizierung für AWS Cloud-Grundlagen, Kernservices, Sicherheit, Architektur und bewährte Praktiken der Kostenoptimierung.",
      priority: 3
    },
    {
      name: "Spark Data Engineer Associate",
      issuer: "Databricks",
      category: "Databricks",
      date: "September 2024",
      validity: "September 2026",
      level: "Associate",
      icon: "images/databricks_de_associate.png",
      link: "https://credentials.databricks.com/dd82d9bc-fa36-4ea2-8e27-5683c0623401#acc.IaG8HjC2",
      description: "Spezialisierung in Data Engineering mit Apache Spark, Delta Lake und modernen Datenarchitekturen. Umfasst ETL, Streaming, Performance-Tuning und Data Governance.",
      priority: 4
    },
    {
      name: "Spark Developer Associate",
      issuer: "Databricks",
      category: "Databricks",
      date: "August 2024",
      validity: "August 2026",
      level: "Associate",
      icon: "images/databricks_spark_dev.png",
      link: "https://credentials.databricks.com/c7fa2bce-f333-4b95-a92d-36a5921b71f8#acc.HpcOW6i5",
      description: "Zertifizierung in der Entwicklung von Apache Spark-Anwendungen für verteilte Datenverarbeitung. Umfasst DataFrame API, SQL, RDD und Performance-Optimierung.",
      priority: 5
    },
    {
      name: "Azure Data Engineer Associate",
      issuer: "Microsoft",
      category: "Azure",
      date: "März 2023",
      validity: "März 2025",
      level: "Associate",
      icon: "images/dp-203.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/30F1ECB9883A367D?sharingId=6EB3B3C8CB10453A",
      description: "Data Engineering-Zertifizierung auf Azure mit Azure Data Factory, Synapse Analytics, Data Lake Storage und Streaming-Services.",
      priority: 5
    },
    {
      name: "Azure Fundamentals",
      issuer: "Microsoft",
      category: "Azure",
      date: "Januar 2023",
      validity: "Läuft nicht ab",
      level: "Fundamentals",
      icon: "images/az-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/597D7B171F02B812?sharingId=6EB3B3C8CB10453A",
      description: "Microsoft Azure-Grundlagenzertifizierung mit Cloud Computing-Konzepten, Kernservices und Preismodellen.",
      priority: 6
    },
    {
      name: "Apache Airflow Fundamentals",
      issuer: "Astronomer",
      category: "Others",
      date: "Juni 2024",
      validity: "Juni 2026",
      level: "Fundamentals",
      icon: "images/badges/airflow_fundamentals.png",
      link: "https://www.credly.com/badges/8b32e72a-de5c-4625-9c69-6b8d6669e18d/linked_in?t=s0dqu1",
      description: "Zertifizierung in Workflow-Orchestrierung mit Apache Airflow für Datenpipeline-Automatisierung. Umfasst DAGs, Operatoren, Sensoren und bewährte Praktiken.",
      priority: 7
    },
    {
      name: "Santander Data Engineer",
      issuer: "Santander Brasil",
      category: "Data Master",
      date: "November 2022",
      validity: "Läuft nicht ab",
      level: "Advanced",
      icon: "images/badges/santander-dea.svg",
      link: "#",
      description: "Fortgeschrittene interne Data Engineering-Zertifizierung von Santander Brasil. Top-10-Ranking nach technischem Fall und umfassender Prüfung zu Big Data, Cloud und verteilten Architekturen.",
      priority: 8
    }
  ]
};
