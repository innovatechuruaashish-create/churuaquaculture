import { complianceRules } from '../data/portalData'

function CompliancePage({ language = 'en' }) {
  const hi = language === 'hi'
  return (
    <div className="page-stack">
      <section className="page-hero compact reveal">
        <p className="eyebrow">{hi ? 'जैव-सुरक्षा और पर्यावरण' : 'Biosecurity and Environment'}</p>
        <h1>{hi ? 'स्थायी झींगा पालन के लिए अनुपालन डैशबोर्ड।' : 'Compliance cockpit for sustainable shrimp farming.'}</h1>
        <p>{hi ? 'बीज ट्रेसबिलिटी, फार्म स्वच्छता, नियंत्रित प्रवेश, जल उपचार और रिकॉर्ड रखरखाव पर आधारित।' : 'Built around seed traceability, farm hygiene, restricted access, water treatment, and record keeping.'}</p>
      </section>

      <section className="compliance-board reveal delay-one">
        <article className="score-card">
          <span>Biosecurity Score</span>
          <strong>86%</strong>
          <p>Quarantine, seed source, access control, and health monitoring verified.</p>
          <div className="progress"><span style={{ width: '86%' }} /></div>
        </article>
        <article className="score-card">
          <span>Environment Score</span>
          <strong>78%</strong>
          <p>Effluent treatment and periodic water monitoring pending final lab upload.</p>
          <div className="progress amber"><span style={{ width: '78%' }} /></div>
        </article>
        <article className="score-card">
          <span>Traceability Score</span>
          <strong>92%</strong>
          <p>Feed, medicine, harvest, and sales records are available for inspection.</p>
          <div className="progress green"><span style={{ width: '92%' }} /></div>
        </article>
      </section>

      <section className="rules-section reveal">
        <div className="section-heading">
          <p className="eyebrow">{hi ? 'नियम और शर्तें' : 'Terms and Conditions'}</p>
          <h2>{hi ? 'पंजीकरण स्थितियों से प्राप्त अनुपालन नियम।' : 'Compliance rules derived from the registration conditions.'}</h2>
        </div>
        <div className="rule-grid">
          {complianceRules.map((rule, index) => (
            <article className="rule-card" key={rule.en || rule}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{hi ? rule.hi : rule.en || rule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="environment-strip reveal">
        <div>
          <h2>{hi ? 'अपशिष्ट जल का अनुपचारित निर्वहन प्रतिबंधित है।' : 'Untreated discharge is prohibited.'}</h2>
          <p>{hi ? 'अपशिष्ट जल को मुक्ति से पहले उपचार किया जाना चाहिए और इसे कृषि भूमि, नहरों या प्राकृतिक जल निकायों में नहीं डाला जा सकता।' : 'Wastewater must be treated before release and cannot be discharged into agricultural land, canals, or natural water bodies.'}</p>
        </div>
        <button type="button" className="primary-btn">{hi ? 'अपशिष्ट चेकलिस्ट खोलें' : 'Open Effluent Checklist'}</button>
      </section>
    </div>
  )
}

export default CompliancePage
