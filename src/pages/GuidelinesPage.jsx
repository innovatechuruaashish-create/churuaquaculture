import { permittedSpecies, qualityChecks } from '../data/portalData'

function GuidelinesPage({ language = 'en' }) {
  const hi = language === 'hi'
  return (
    <div className="page-stack">
      <section className="page-hero reveal">
        <p className="eyebrow">{hi ? 'दिशा-निर्देश सारांश' : 'Guideline Summary'}</p>
        <h1>{hi ? 'अंतर्देशीय लवणीय जल मत्स्य पालन के लिए संरचित नियामक ढांचा।' : 'Structured regulatory framework for inland saline water aquaculture.'}</h1>
        <p>
          {hi ? 'मत्स्य विभाग पंजीकरण, लाइसेंस, निरीक्षण, निगरानी और प्रवर्तन के लिए सक्षम प्राधिकरण है।' : 'The Fisheries Department is the competent authority for registration, licensing, inspection, monitoring, and enforcement in inland saline areas outside CAA jurisdiction.'}
        </p>
      </section>

      <section className="guideline-grid reveal delay-one">
        <article className="section-panel">
          <span className="panel-number">01</span>
          <h2>{hi ? 'प्रयोज्यता' : 'Applicability'}</h2>
          <p>{hi ? 'राजस्थान के अंतर्देशीय लवणीय जल क्षेत्रों में किए जाने वाले झींगा पालन गतिविधियों पर लागू होता है।' : 'Applies to shrimp farming activities undertaken in inland saline water areas of Rajasthan.'}</p>
        </article>
        <article className="section-panel">
          <span className="panel-number">02</span>
          <h2>{hi ? 'पंजीकरण' : 'Registration'}</h2>
          <p>{hi ? 'संचालन शुरू करने से पहले सभी झींगा पालन को पंजीकृत होना चाहिए। बिना वैध लाइसेंस के पालन प्रतिबंधित है।' : 'All shrimp farms must be registered before operations. Farming without a valid license is prohibited.'}</p>
        </article>
        <article className="section-panel">
          <span className="panel-number">03</span>
          <h2>{hi ? 'वैधता' : 'Validity'}</h2>
          <p>{hi ? 'पंजीकरण तीन साल के लिए वैध है। समाप्ति से कम से कम एक महीने पहले नवीनीकरण के लिए आवेदन करना होगा।' : 'Registration is valid for three years. Renewal must be applied at least one month before expiry.'}</p>
        </article>
        <article className="section-panel">
          <span className="panel-number">04</span>
          <h2>{hi ? 'शुल्क' : 'Fee'}</h2>
          <p>{hi ? 'पंजीकरण शुल्क ₹500 है। नवीनीकरण शुल्क ₹250 मत्स्य विभाग निदेशक को देय है।' : 'Registration fee is Rs. 500. Renewal fee is Rs. 250 payable to the Director, Fisheries Department.'}</p>
        </article>
      </section>

      <section className="split-section reveal">
        <div className="section-panel">
          <p className="eyebrow">{hi ? 'साइट उपयुक्तता' : 'Site Suitability'}</p>
          <h2>{hi ? 'संस्कृति से पहले परीक्षण करने के लिए जल गुणवत्ता मापदंड।' : 'Water quality parameters to be tested before culture.'}</h2>
          <div className="quality-grid">
            {qualityChecks.map((check) => (
              <div className="quality-chip" key={check.label}>
                <strong>{hi ? check.labelHi : check.label}</strong>
                <span>{hi ? check.valueHi : check.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-panel dark-panel">
          <p className="eyebrow">{hi ? 'प्रजाति नियम' : 'Species Rules'}</p>
          <h2>{hi ? 'केवल स्वीकृत झींगा प्रजातियों की डिफ़ॉल्ट रूप से अनुमति है।' : 'Only approved shrimp species are allowed by default.'}</h2>
          <div className="species-mini-list">
            {permittedSpecies.map((species) => (
              <article key={species.name}>
                <h3>{species.name}</h3>
                <p>{hi ? species.commonHi : species.common}</p>
                <strong>{hi ? species.salinityHi : species.salinity}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wide-callout reveal">
        <div>
          <p className="eyebrow">{hi ? 'केंद्रीय समन्वय' : 'Central Coordination'}</p>
          <h2>{hi ? 'ट्रेसबिलिटी और निर्यात अनुपालन समर्थन' : 'Traceability and export compliance support'}</h2>
          <p>{hi ? 'आवश्यकतानुसार ट्रेसबिलिटी और निर्यात अनुपालन के लिए फार्म जानकारी MPEDA और अन्य केंद्रीय एजेंसियों के साथ साझा की जा सकती है।' : 'Farm information can be shared with MPEDA and other central agencies where needed for traceability and export compliance.'}</p>
        </div>
        <span>Annexure IX</span>
      </section>
    </div>
  )
}

export default GuidelinesPage
