import "./Privacy.scss";

const Privacy = () => {
  return (
    <main className="privacy-container">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: July 24, 2026</p>

      <p>
        Creative Journeys Travel PH (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a
        wholesaler travel agency based in the Philippines. This policy explains
        what personal information we collect through our inquiry form, why we
        collect it, how long we keep it, and the rights you have under the Data
        Privacy Act of 2012 (Republic Act No. 10173). For the purposes of that
        Act, we act as the personal information controller for the data you
        submit to us.
      </p>

      <h2>Information we collect</h2>
      <p>When you submit a travel inquiry, we collect:</p>
      <ul>
        <li>
          <strong>Contact details</strong> — your name, email address, WhatsApp
          number, mailing address, and company name (if you provide one).
        </li>
        <li>
          <strong>Trip details</strong> — your destination of interest, travel
          dates, number of travellers, accommodation and room preferences,
          budget range, and any notes you choose to share.
        </li>
        <li>
          <strong>Technical details</strong> — a one-way hashed version of your
          IP address (we never store the raw address), your browser type, and
          how you reached our site. These help us prevent spam and abuse.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to your inquiry and prepare a quotation.</li>
        <li>
          To contact you about your enquiry and arrange your travel programme.
        </li>
        <li>To keep a record of your request and our correspondence.</li>
        <li>
          To protect our site and other users from spam and fraudulent
          submissions.
        </li>
      </ul>
      <p>
        We only send you marketing messages if you have separately ticked the
        optional marketing consent box. We do not sell your personal
        information.
      </p>

      <h2>Legal basis</h2>
      <p>
        We process your information on the basis of the consent you give when
        you submit the form, and as necessary to take steps at your request
        before entering into a service arrangement with you. You may withdraw
        your consent at any time by contacting us (see below); this does not
        affect processing already carried out.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share your information only with service providers who help us
        operate this service, and only to the extent they need it:
      </p>
      <ul>
        <li>Our website hosting and database providers, who store the data.</li>
        <li>
          Our email delivery provider, used to send you an acknowledgement and
          to notify our team of your enquiry.
        </li>
      </ul>
      <p>
        These providers are bound to protect your information and may only use
        it to provide services to us. We may also disclose information if
        required to do so by law.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your inquiry for as long as needed to handle your request and
        our relationship with you, and for a reasonable period afterwards to
        meet business and legal record-keeping needs — ordinarily no longer than
        24 months after our last contact. You may ask us to delete it sooner.
      </p>

      <h2>How we protect it</h2>
      <p>
        We use reasonable organisational and technical measures to protect your
        information, including transport encryption (HTTPS) and storing your IP
        address only in hashed form. No method of transmission or storage is
        completely secure, but we work to safeguard your data.
      </p>

      <h2>Your rights</h2>
      <p>Under RA 10173 you have the right to:</p>
      <ul>
        <li>Be informed about how your data is processed.</li>
        <li>Access the personal data we hold about you.</li>
        <li>Correct any inaccurate or outdated information.</li>
        <li>Object to processing, or withdraw your consent.</li>
        <li>Request the erasure or blocking of your data.</li>
        <li>Obtain a copy of your data in a portable format.</li>
        <li>Be indemnified for damages arising from unlawful processing.</li>
      </ul>
      <p>
        You also have the right to lodge a complaint with the National Privacy
        Commission (privacy.gov.ph).
      </p>

      <h2>Contact us</h2>
      <p>
        To exercise any of these rights, or for any question about this policy,
        contact us at{" "}
        <a href="mailto:hello@creativejourneysph.com">
          hello@creativejourneysph.com
        </a>{" "}
        or by post at #4 San Guillermo Street, Brgy. Bayanan, Muntinlupa City,
        Philippines.
      </p>
    </main>
  );
};

export default Privacy;
