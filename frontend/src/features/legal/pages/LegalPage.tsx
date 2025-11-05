import styles from "./LegalPage.module.scss"

export function LegalPage() {
  return (
    <div className={styles.legalContainer}>
      <h1>Informations légales</h1>
      <p className={styles.warning}>AVIS IMPORTANT CONCERNANT LE SITE BLABLABOOK<br/> L’intégralité du site Blablabook constitue un exercice pédagogique, exclusivement réalisé dans le cadre d’une préparation à un examen pour l’obtention d’un titre professionnel. Ce site ne doit en aucun cas être interprété comme une offre de service commercial, ni servir à des fins autres qu’éducatives et formatives.Tous les composants présents (photographies, polices d’écriture, logos, textes) sont protégés par des droits d’auteur. Toutefois, leur usage est ici strictement limité au contexte scolaire et non commercial de ce projet, conformément aux règles de l’établissement et à la législation applicable.</p>

      {/* CONTACT */}
      <section id="contact" className={styles.section}>
        <h2>Contact</h2>
        <p>Vous avez une question, une suggestion ou besoin d'aide ?</p>
        <p>Email : <a href="mailto:blablabook.exo@gmail.com">blablabook.exo@gmail.com</a></p>

        <p>Suivez-nous sur les réseaux sociaux :</p>
        <ul>
          <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>
          <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">YouTube</a></li>
        </ul>
      </section>

      {/* CGU */}
      <section id="cgu" className={styles.section}>
        <h2>Conditions Générales d'Utilisation (CGU)</h2>

        <h3>1. Objet</h3>
        <p>Les présentes CGU définissent les modalités d'utilisation de BlaBlaBook.</p>

        <h3>2. Acceptation</h3>
        <p>L'utilisation de la plateforme implique l'acceptation des présentes CGU.</p>

        <h3>3. Inscription</h3>
        <p>L'inscription est gratuite et nécessite une adresse email valide.</p>

        <h3>4. Utilisation</h3>
        <p>BlaBlaBook permet de partager des critiques, gérer sa bibliothèque et découvrir de nouveaux livres.</p>

        <h3>5. Propriété intellectuelle</h3>
        <p>Le contenu publié appartient aux utilisateurs. BlaBlaBook dispose d'une licence non-exclusive pour l'afficher.</p>

        <h3>6. Responsabilités</h3>
        <p>Les utilisateurs sont responsables de leur contenu. BlaBlaBook se réserve le droit de modération.</p>
      </section>

      {/* POLITIQUE DE CONFIDENTIALITÉ */}
      <section id="privacy" className={styles.section}>
        <h2>Politique de Confidentialité</h2>

        <h3>1. Données collectées</h3>
        <p>Nous collectons : email, nom d'utilisateur, données de navigation et contenu publié.</p>

        <h3>2. Utilisation des données</h3>
        <p>Vos données servent à gérer votre compte, personnaliser l'expérience et améliorer nos services.</p>

        <h3>3. Protection</h3>
        <p>Nous protégeons vos données avec des mesures de sécurité appropriées.</p>

        <h3>4. Partage</h3>
        <p>Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement avec votre consentement ou obligation légale.</p>

        <h3>5. Vos droits (RGPD)</h3>
        <p>Vous disposez des droits d'accès, rectification, effacement, portabilité et opposition.</p>
        <p>Pour exercer vos droits : <a href="mailto:blablabook.exo@gmail.com">blablabook.exo@gmail.com</a></p>

        <h3>6. Conservation</h3>
        <p>Vos données sont conservées tant que votre compte est actif. Suppression sous 30 jours après demande.</p>
      </section>

      <p className={styles.legalDate}>Dernière mise à jour : Janvier 2025</p>
    </div>
  )
}
