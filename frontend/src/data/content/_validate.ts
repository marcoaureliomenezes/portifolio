import { portugueseContent } from './pt';
import { englishContent } from './en';
import { germanContent } from './de';

function validateContentParity() {
  const ptCerts = portugueseContent.certifications.map(c => c.name);
  const enCerts = englishContent.certifications.map(c => c.name);
  const deCerts = germanContent.certifications.map(c => c.name);

  if (ptCerts.length !== enCerts.length || ptCerts.length !== deCerts.length) {
    throw new Error(
      `Certification count mismatch: PT=${ptCerts.length}, EN=${enCerts.length}, DE=${deCerts.length}`
    );
  }

  const ptExps = portugueseContent.experiences.map(e => e.company);
  const enExps = englishContent.experiences.map(e => e.company);
  const deExps = germanContent.experiences.map(e => e.company);

  if (ptExps.length !== enExps.length || ptExps.length !== deExps.length) {
    throw new Error(
      `Experience count mismatch: PT=${ptExps.length}, EN=${enExps.length}, DE=${deExps.length}`
    );
  }
}

validateContentParity();
