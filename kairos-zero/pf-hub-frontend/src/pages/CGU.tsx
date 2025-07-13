import React from 'react';

const CGU: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      color: 'var(--color-text)',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4rem',
        padding: '2rem 0'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          TERMS OF USE
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          PeakFlow Technologies
        </p>
      </div>

      {/* CGU Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--color-border)',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)'
        }}>
          1. Service Presentation
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          These Terms of Use (hereinafter "ToU") govern access to and use of the PeakFlow website (hereinafter the "Site"), published by Antoine Boubée, individual entrepreneur, under the PeakFlow Technologies brand.
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The Site offers a personalized sports performance prediction service, based on analysis of users' training data, particularly through connection with the Strava API.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          2. Site Publisher
        </h2>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Name: Antoine Boubée</li>
          <li>Commercial name: PeakFlow Technologies</li>
          <li>Status: Individual entrepreneur</li>
          <li>Email: peakflow.corp@gmail.com</li>
          <li>Site hosting: render</li>
        </ul>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          3. Service Access
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Access to the service requires creating a user account. The user agrees to provide accurate information during registration and to keep it up to date.
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The service is open to any individual over 16 years of age. Minors must obtain prior authorization from their legal representative.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          4. Strava Data Usage
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          By connecting to Strava via OAuth, the user authorizes PeakFlow to access their activity data (runs, speeds, elevation profiles, etc.) for the exclusive purpose of providing personalized analyses and predictions.
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The user can revoke access at any time from their Strava account.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          5. Paid Features
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Some advanced features are accessible by subscription or pay-per-use. The terms, rates and payment conditions are specified on a dedicated page of the Site.
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          No refund will be made once the subscription is activated, except for contrary legal provisions.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          6. User Behavior
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The user agrees to:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Use the service fairly and in accordance with its purpose</li>
          <li>Not attempt to disrupt or circumvent the Site's security mechanisms</li>
          <li>Not extract data massively, nor make unauthorized commercial use of it</li>
        </ul>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          7. Intellectual Property
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          All elements of the Site (logos, texts, algorithms, interfaces) are the exclusive property of Antoine Boubée. Any reproduction, distribution or exploitation without prior authorization is prohibited.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          8. Personal Data Protection
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The personal data collected (email, name, Strava data, preferences) are processed in accordance with the General Data Protection Regulation (GDPR).
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          For more information, see our Privacy Policy below.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          9. Account Termination
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Each user can delete their account at any time from their personal space.
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          In case of non-compliance with the ToU, PeakFlow reserves the right to suspend or delete an account, without notice.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          10. Limitation of Liability
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          PeakFlow Technologies cannot be held responsible in case of:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Error or inaccuracy in predictions</li>
          <li>Temporary unavailability of the service</li>
          <li>Unauthorized use of the account by a third party</li>
        </ul>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The use of the provided predictions is made under the sole responsibility of the user.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          11. ToU Modifications
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          These ToU may be modified at any time. Users will be notified in case of substantial change. Continued use of the service constitutes acceptance of the modified ToU.
        </p>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)',
          marginTop: '3rem'
        }}>
          12. Applicable Law and Jurisdiction
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          These ToU are subject to French law. In case of dispute, French courts will have sole jurisdiction.
        </p>
      </div>

      {/* Privacy Policy */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--color-border)',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '2rem',
          color: 'var(--color-text)',
          textAlign: 'center'
        }}>
          PRIVACY POLICY
        </h2>
        <p style={{
          fontSize: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Last updated: July 13, 2025
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)'
        }}>
          1. Data Controller Identity
        </h3>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Controller: Antoine Boubée</li>
          <li>Commercial name: PeakFlow Technologies</li>
          <li>Status: Individual entrepreneur</li>
          <li>Contact email: antoineboubee1@gmail.com</li>
        </ul>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          2. Collected Data
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          a. Personal data provided by the user:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>First and last name (if provided)</li>
          <li>Email address</li>
          <li>Connection information (Strava identifier)</li>
          <li>Payment information (managed via a secure third-party provider)</li>
        </ul>

        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          b. Data collected via Strava API:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Sports activities (distance, time, pace, power, heart rate...)</li>
          <li>Elevation profiles</li>
          <li>Best efforts and performances</li>
          <li>Training statistics</li>
        </ul>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          3. Processing Purpose
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Data is collected to:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Provide personalized sports performance predictions</li>
          <li>Enable secure connection via Strava</li>
          <li>Display progression analyses</li>
          <li>Manage paid subscriptions</li>
          <li>Improve service quality</li>
        </ul>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          No data will be used for advertising purposes or resold to third parties.
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          4. Legal Basis for Processing
        </h3>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Contract execution: to provide the requested service</li>
          <li>Consent: for Strava connection, personal data analysis or marketing emails</li>
          <li>Legal obligation: in case of billing or litigation</li>
        </ul>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          5. Data Recipients
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Data is processed only by:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>The service controller (Antoine Boubée)</li>
          <li>Technical providers essential to operation (hosting, payment tool, database)</li>
          <li>Strava, as part of OAuth authentication</li>
        </ul>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          No data is transferred to other third parties without your consent.
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          6. Data Retention Period
        </h3>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>User account data: retained as long as the account is active</li>
          <li>Strava data: deleted immediately upon access revocation or account deletion</li>
          <li>Billing data: retained for 6 years in accordance with legal obligations</li>
        </ul>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          7. Data Security
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Data is stored on secure servers. Technical measures (encryption, strong authentication) and organizational measures (restricted access, monitoring) are implemented to protect your information.
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          8. Your Rights
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          In accordance with the GDPR, you have the following rights:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>Right of access</li>
          <li>Right of rectification</li>
          <li>Right to erasure</li>
          <li>Right to object</li>
          <li>Right to portability</li>
        </ul>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          To exercise these rights, contact: peakflow.corp@gmail.com
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          9. Strava Access Revocation
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          You can revoke PeakFlow's access to your Strava account at any time:
        </p>
        <ul style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          paddingLeft: '2rem'
        }}>
          <li>From your user space on the Site</li>
          <li>Or directly via your Strava account settings (https://www.strava.com/settings/apps)</li>
        </ul>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          10. Policy Modifications
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          This policy may be updated at any time. In case of significant change, you will be notified by email or on the site.
        </p>

        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          marginTop: '2rem'
        }}>
          11. Contact
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          For any questions regarding this policy:
        </p>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Email: peakflow.corp@gmail.com
        </p>
      </div>
    </div>
  );
};

export default CGU; 