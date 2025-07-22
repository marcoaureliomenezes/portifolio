import { ContentData } from './types';

export const englishContent: ContentData = {
  resumeTitle: "Resume",
  skillsTitle: "Skills",
  experienceTitle: "Professional Experience",
  educationTitle: "Education", 
  certificationsTitle: "Certifications",
  seeMore: "See more",
  seeLess: "See less",
  responsibilities: "Responsibilities:",
  technologies: "Technologies:",
  validUntil: "Valid until",
  viewCredential: "View credential",
  resume: {
    short: "Senior Data Engineer with over 8 years of experience in Python language, 4 years of professional experience, designing and implementing data pipelines related to Big Data workloads, using Python, Spark, Hadoop Ecosystem and SQL for validations. Over 2 years migrating data pipelines and systems from on-premises to Cloud - Azure + Databricks. Since this year responsible for migrating accounting streaming data pipelines to AWS...",
    full: "Senior Data Engineer with over 8 years of experience in Python language, 4 years of professional experience, designing and implementing data pipelines related to Big Data workloads, using Python, Spark, Hadoop Ecosystem and SQL for validations. Over 2 years migrating data pipelines and systems from on-premises to Cloud - Azure + Databricks. Since this year responsible for migrating accounting streaming data pipelines to AWS. Background in Control and Automation Engineering. Recognized for expertise in Python, Spark and big data fundamentals with passion for sharing knowledge. Proven ability to integrate DE concepts with new tools and frameworks as technology evolves, always balancing purpose, performance, costs and other trade-offs."
  },
  skills: [
    {
      title: "Languages",
      icon: "🌍",
      skills: ["Portuguese (Native)", "English (Advanced)"]
    },
    {
      title: "Programming Languages",
      icon: "💻",
      skills: ["Python", "SQL", "Scala", "Java"]
    },
    {
      title: "Cloud Providers",
      icon: "☁️",
      skills: ["AWS", "Azure", "Databricks"]
    },
    {
      title: "On-premises Data Technologies",
      icon: "🏗️",
      skills: ["Hadoop", "Hive", "Spark", "Kafka"]
    },
    {
      title: "DevOps Technologies",
      icon: "🔧",
      skills: ["Git", "GitHub", "GitHub Actions", "Jenkins", "Docker"]
    }
  ],
  experiences: [
    {
      company: "F1rst Digital Services",
      fullName: "F1rst Digital Services - Santander Brazil",
      location: "São Paulo, SP - Brazil",
      totalPeriod: "05-2021 to Present",
      type: "main",
      roles: [
        {
          title: "Senior Data Engineer",
          period: "02-2024 to Present",
          responsibilities: [
            "Responsible for conducting the DE accounting team through the Data Transformation strategic movement",
            "Migrated batch and streaming data pipelines from on-premises to Azure using Databricks, Data Factory and ADLS gen2",
            "Migrated streaming pipelines (DB2, Kafka, Spark Streaming, ScyllaDB, Openshift) to AWS (MSK, Aurora, EKS)",
            "Designed daily batch pipelines to deliver Bronze and Silver Accounting Delta tables to Cash Management domain"
          ],
          technologies: "Spark, Hadoop, Hive, Databricks, Azure Data Factory, ADLS gen2, Amazon MSK, Aurora, EKS, S3, CloudWatch"
        },
        {
          title: "Mid-level Data Engineer",
          period: "07-2022 to 02-2024",
          responsibilities: [
            "Led Cloud migration for the Operational Discontinuity Plan system, improving durability of Hive tables across clusters",
            "Copied Delta tables between Azure data lakes with zone redundancy configuration to reduce storage costs",
            "Ensured governance, compliance and security for high-volume sensitive data migrations"
          ],
          technologies: "Python, Spark, Shell Script, Hadoop Ecosystem, Databricks, Azure Cloud"
        },
        {
          title: "Junior Data Engineer",
          period: "05-2021 to 07-2022",
          responsibilities: [
            "Migrated on-premises Hadoop and Hive jobs to Databricks platform on Azure cloud",
            "Developed Python pipelines for data transformation and REST API integration",
            "Implemented structured logging and monitoring for critical data pipelines"
          ],
          technologies: "Python, Spark, Hadoop, Hive, Databricks, Azure, Shell Script"
        }
      ]
    },
    {
      company: "Trie Engineering",
      fullName: "Trie Engineering",
      location: "Remote",
      totalPeriod: "10-2020 to 05-2021",
      type: "minor",
      roles: [
        {
          title: "Junior Data Engineer",
          period: "10-2020 to 05-2021",
          responsibilities: [
            "Maintained ETL pipelines feeding dashboards from Google Sheets and field data",
            "Provided data feeds to support decision-making for cement industry stakeholders"
          ],
          technologies: "Python, Pandas, NumPy"
        }
      ]
    },
    {
      company: "Fire Labs - Federal University of Ouro Preto",
      fullName: "Fire Labs - Federal University of Ouro Preto",
      location: "Ouro Preto, MG - Brazil",
      totalPeriod: "08-2016 to 08-2017",
      type: "minor",
      roles: [
        {
          title: "Scholarship Recipient",
          period: "08-2016 to 08-2017",
          responsibilities: [
            "Developed embedded software for gas oven control via temperature and flow sensors using Arduino",
            "Implemented control loops on C for AC motor and gas valve automation"
          ],
          technologies: "C, Arduino, Control Systems"
        }
      ]
    },
    {
      company: "Analógica Instrumentation and Control",
      fullName: "Analógica Instrumentation and Control",
      location: "Ouro Preto, MG - Brazil",
      totalPeriod: "01-2015 to 02-2015",
      type: "minor",
      roles: [
        {
          title: "Summer Intern",
          period: "01-2015 to 02-2015",
          responsibilities: [
            "Built Python application to extract sensor data from fuel tanks for downstream ingestion",
            "First professional experience with Python on Raspberry PI platform"
          ],
          technologies: "Python, Raspberry PI"
        }
      ]
    }
  ],
  education: {
    degree: "Bachelor of Control And Automation Engineering",
    institution: "Federal University of Ouro Preto, Minas Gerais, Brazil",
    period: "08/2018",
    coursework: "Relevant coursework: Electronics, embedded systems, control systems design, C and Python.",
    thesis: "Bachelor Thesis: Analysis of the Dynamics and Design of Temperature Controllers for Electric Showers."
  },
  certifications: [
    {
      name: "AWS Data Engineer",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "December 2024",
      validity: "December 2027",
      level: "Associate",
      icon: "images/badges/aws_data_engineer_associate.png",
      link: "https://www.credly.com/badges/831befd4-10d8-47db-97c7-021b3915be1f/linked_in?t=ss25e1",
      description: "Advanced AWS data engineering certification covering pipelines, ETL, storage, and data analysis at scale. Includes services like Glue, Redshift, Kinesis, EMR, and Lake Formation.",
      priority: 1
    },
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "January 2025",
      validity: "January 2028",
      level: "Associate",
      icon: "images/badges/aws_solutions_architect_associate.png",
      link: "https://www.credly.com/badges/3d7aeb44-78db-430f-8103-550f89660989/public_url",
      description: "Certification in AWS solutions architecture, covering design of distributed systems, high availability, fault tolerance, and cost optimization. Includes services like EC2, VPC, S3, RDS, Lambda, and CloudFormation.",
      priority: 2
    },
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      category: "AWS",
      date: "July 2024",
      validity: "July 2027",
      level: "Foundational",
      icon: "images/badges/aws_practitioner.png",
      link: "https://www.credly.com/badges/7b3fe40d-4525-4b6b-bd1f-be2c90bfbac4/linked_in?t=seidpj",
      description: "Foundational certification covering AWS Cloud basics, core services, security, architecture, and cost optimization best practices.",
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
      description: "Specialization in data engineering with Apache Spark, Delta Lake, and modern data architectures. Covers ETL, streaming, performance tuning, and data governance.",
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
      description: "Certification in developing Apache Spark applications for distributed data processing. Includes DataFrame API, SQL, RDD, and performance optimization.",
      priority: 5
    },
    {
      name: "Azure Data Engineer Associate",
      issuer: "Microsoft",
      category: "Azure",
      date: "March 2023",
      validity: "March 2025",
      level: "Associate",
      icon: "images/dp-203.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/30F1ECB9883A367D?sharingId=6EB3B3C8CB10453A",
      description: "Data engineering certification on Azure, covering Azure Data Factory, Synapse Analytics, Data Lake Storage, and streaming services.",
      priority: 5
    },
    {
      name: "Azure Fundamentals",
      issuer: "Microsoft",
      category: "Azure",
      date: "January 2023",
      validity: "Does not expire",
      level: "Fundamentals",
      icon: "images/az-900.png",
      link: "https://learn.microsoft.com/api/credentials/share/pt-br/MarcoAurelioMenezes-1325/597D7B171F02B812?sharingId=6EB3B3C8CB10453A",
      description: "Microsoft Azure fundamental certification covering cloud computing concepts, core services, and pricing models.",
      priority: 6
    },
    {
      name: "Apache Airflow Fundamentals",
      issuer: "Astronomer",
      category: "Others",
      date: "June 2024",
      validity: "June 2026",
      level: "Fundamentals",
      icon: "images/badges/airflow_fundamentals.png",
      link: "https://www.credly.com/badges/8b32e72a-de5c-4625-9c69-6b8d6669e18d/linked_in?t=s0dqu1",
      description: "Certification in workflow orchestration with Apache Airflow for data pipeline automation. Covers DAGs, operators, sensors, and best practices.",
      priority: 7
    },
    {
      name: "Santander Data Engineer",
      issuer: "Santander Brazil",
      category: "Data Master",
      date: "November 2022",
      validity: "Does not expire",
      level: "Advanced",
      icon: "images/badges/santander-dea.svg",
      link: "#",
      description: "Advanced internal data engineering certification from Santander Brazil. Top 10 ranking after technical case and comprehensive exam covering Big Data, Cloud, and distributed architectures.",
      priority: 8
    }
  ]
};