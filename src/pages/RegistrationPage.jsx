import { documents } from '../data/portalData'
import { useState } from 'react'
const DECLARATION_TEXT =
  "मैं घोषणा करता/करती हूँ कि इस आवेदन पत्र में मेरे द्वारा दी गई समस्त जानकारी एवं अपलोड किए गए सभी दस्तावेज मेरे ज्ञान एवं विश्वास के अनुसार पूर्णतः सत्य, सही एवं प्रमाणिक हैं। यदि भविष्य में कोई जानकारी अथवा दस्तावेज असत्य अथवा भ्रामक पाए जाते हैं, तो मेरा आवेदन निरस्त किया जा सकता है तथा विभाग द्वारा नियमानुसार कार्यवाही की जा सकती है।";
const initialForm = {
  applicant: '',
  father: '',
  address: '',
  age: '',
  category: '',
  email: '',
  mobile: '',
  nfdp: '',
  ownership: '',
  khasra: '',
  village: '',
  tehsil: '',
  salinity: '',
  latitude: '',
  longitude: '',
  area: '',
  ponds: '',
  waterSource: '',
  species: '',
  assistance: '',
  supportiveDocuments: '',
  patwariReport: '',
  affidavitNoc: '',
  aadhaarCard: null,
  landOwnershipDocument: null,
  farmPhotograph: null,
  otherDocuments: [null],
declaration: false,
  uploadedFiles: [],
}

function RegistrationPage({ language = 'en', notifications = [], onApplicationSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hi = language === 'hi'

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  
async function handleSubmit(event) {
  event.preventDefault();
  setIsSubmitting(true);
  setMessage("");

  try {
    const formData = new FormData();

    // =========================
    // FARMER DETAILS
    // =========================

    formData.append("farmerName", form.applicant);
    formData.append("fatherName", form.father);
    formData.append("mobile", form.mobile);
    formData.append("email", form.email);
    formData.append("aadhaarNumber", form.nfdp);

    formData.append("address", form.address);
    formData.append("village", form.village);
    formData.append("tehsil", form.tehsil);
    formData.append("district", "Churu");
    formData.append("state", "Rajasthan");

    // New fields
    formData.append("category", form.category);
    formData.append("landOwnership", form.ownership);

    // =========================
    // FARM DETAILS
    // =========================

    formData.append("farmName", "");
    formData.append("farmArea", form.area);
    formData.append("pondCount", form.ponds);
    formData.append("waterSource", form.waterSource);
    formData.append("cultureType", form.species);

    // New fields
    formData.append("khasraNumber", form.khasra);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);

    formData.append(
      "landDetails",
      `Land Ownership: ${form.ownership}, Khasra Number: ${form.khasra}`
    );

    // =========================
    // DECLARATION
    // =========================

    formData.append(
      "declarationAccepted",
      form.declaration.toString()
    );

    formData.append(
      "declarationText",
      DECLARATION_TEXT
    );

    // =========================
    // FILES
    // =========================

    if (form.aadhaarCard) {
      formData.append(
        "aadhaarCard",
        form.aadhaarCard
      );
    }

    if (form.landOwnershipDocument) {
      formData.append(
        "landOwnershipDocument",
        form.landOwnershipDocument
      );
    }

    if (form.patwariReport) {
      formData.append(
        "patwariReport",
        form.patwariReport
      );
    }

    if (form.waterQualityTestReport) {
      formData.append(
        "waterQualityTestReport",
        form.waterQualityTestReport
      );
    }

    if (form.pondPhotograph) {
      formData.append(
        "pondPhotograph",
        form.pondPhotograph
      );
    }

    if (form.farmerPhotograph) {
      formData.append(
        "farmerPhotograph",
        form.farmerPhotograph
      );
    }

    if (form.otherDocuments?.length) {
      form.otherDocuments.forEach((file) => {
        if (file) {
          formData.append(
            "otherDocuments",
            file
          );
        }
      });
    }

    // =========================
    // DEBUG
    // =========================

    
    for (const [key, value] of formData.entries()) {
      console.log(
        key,
        value instanceof File
          ? value.name
          : value
      );
    }

    // =========================
    // API REQUEST
    // =========================

    const response = await fetch(
      "https://backend-of-fisheries.onrender.com/api/application/create",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Application submission failed"
      );
    }

   setMessage(
  `Application Submitted Successfully. Tracking Number: ${data.applicationNumber}`
);

    setForm(initialForm);

  } catch (error) {
    console.error(
      "Application Submit Error:",
      error
    );

    setMessage(error.message);

  } finally {
    setIsSubmitting(false);
  }
}
  return (
   <> <div className="page-stack reg-page">
      <section className="page-hero compact reveal reg-hero">
        <p className="eyebrow">{hi ? 'अनुलग्नक I' : 'Annexure I'}</p>
        <h1>{hi ? 'अंतर्देशीय लवणीय जल मत्स्य पालन फार्म के पंजीकरण के लिए आवेदन' : 'Application for Registration of Inland Saline Water Aquaculture Farm'}</h1>
        <p>{hi ? 'निर्धारित मत्स्य विभाग प्रारूप के आधार पर फ्रंट-एंड फॉर्म संरचना।' : 'Front-end form structure based on the prescribed Fisheries Department format.'}</p>
      </section>

      <section className="registration-layout reveal delay-one">
        <form className="premium-form" onSubmit={handleSubmit}>
          <div className="reg-card">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h2>{hi ? 'आवेदक विवरण' : 'Applicant Details'}</h2>
              <p>{hi ? 'पहचान, एनएफडीपी और संपर्क जानकारी।' : 'Identity, NFDP, and contact information.'}</p>
            </div>
          </div>

          <div className="form-grid">
            <label>{hi ? 'आवेदक का नाम' : 'Applicant Name'}<input type="text" value={form.applicant} placeholder={hi ? 'पूरा नाम' : 'Full name'} onChange={(event) => updateField('applicant', event.target.value)} /></label>
            <label>{hi ? 'पिता / पति का नाम' : 'Father / Husband Name'}<input type="text" value={form.father} placeholder={hi ? 'अभिभावक का नाम' : 'Guardian name'} onChange={(event) => updateField('father', event.target.value)} /></label>
            <label>{hi ? 'स्थायी डाक पता' : 'Permanent Postal Address'}<input type="text" value={form.address} placeholder={hi ? 'पिन कोड के साथ पता' : 'Address with pin code'} onChange={(event) => updateField('address', event.target.value)} /></label>
            <label>{hi ? 'आयु' : 'Age'}<input type="number" value={form.age} placeholder={hi ? 'आयु' : 'Age'} onChange={(event) => updateField('age', event.target.value)} /></label>
            <label>{hi ? 'श्रेणी' : 'Category'}<select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
              <option value="" disabled>{hi ? 'श्रेणी चुनें' : 'Select category'}</option>
              <option value="GEN">{hi ? 'सामान्य (GEN)' : 'GEN'}</option>
              <option value="OBC">{hi ? 'ओबीसी (OBC)' : 'OBC'}</option>
              <option value="SC">{hi ? 'एससी (SC)' : 'SC'}</option>
              <option value="ST">{hi ? 'एसटी (ST)' : 'ST'}</option>
            </select></label>
            <label>{hi ? 'ईमेल पता' : 'Email Address'}<input type="email" value={form.email} placeholder="applicant@example.com" onChange={(event) => updateField('email', event.target.value)} /></label>
            <label>{hi ? 'मोबाइल नंबर' : 'Mobile Number'}<input type="tel" value={form.mobile} placeholder={hi ? '10 अंकों का मोबाइल' : '10 digit mobile'} onChange={(event) => updateField('mobile', event.target.value)} /></label>
            <label>{hi ? 'आधार नंबर ' : 'Aadhar Number'}<input type="text" value={form.nfdp} placeholder={hi ? 'xxxx xxxx xxxx' : 'xxxx xxxx xxxx'} onChange={(event) => updateField('nfdp', event.target.value)} /></label>
            <label>{hi ? 'भूमि स्वामित्व' : 'Land Ownership'}<select value={form.ownership} onChange={(event) => updateField('ownership', event.target.value)}><option value="" disabled>{hi ? 'स्वामित्व चुनें' : 'Select ownership'}</option><option value="Self">{hi ? 'स्वयं' : 'Self'}</option><option value="Leased">{hi ? 'पट्टे पर' : 'Leased'}</option></select></label>
          </div>
          </div>

          <div className="reg-card">
          <div className="form-section-title">
            <span>02</span>
            <div>
              <h2>{hi ? 'खेत का स्थान' : 'Farm Location'}</h2>
              <p>{hi ? 'खसरा, क्षेत्रफल, तालाब और जीपीएस जानकारी।' : 'Khasra, area, pond, and GPS information.'}</p>
            </div>
          </div>

          <div className="form-grid">
            <label>{hi ? 'खसरा नंबर' : 'Khasra Number'}<input type="text" value={form.khasra} placeholder={hi ? 'उदा. 142/3' : 'e.g. 142/3'} onChange={(event) => updateField('khasra', event.target.value)} /></label>
            <label>{hi ? 'गांव' : 'Village'}<input type="text" value={form.village} placeholder={hi ? 'गांव' : 'Village'} onChange={(event) => updateField('village', event.target.value)} /></label>
            <label>{hi ? 'तहसील' : 'Tehsil'}<select value={form.tehsil} onChange={(event) => updateField('tehsil', event.target.value)}>
              <option value="" disabled>{hi ? 'तहसील चुनें' : 'Select tehsil'}</option>
               <option value="Bidasar">{hi ? 'बीदासर' : 'Bidasar'}</option>
              <option value="Churu">{hi ? 'चूरू' : 'Churu'}</option>
               <option value="Rajgarh">{hi ? 'राजगढ़' : 'Rajgarh'}</option>
              <option value="Ratangarh">{hi ? 'रतनगढ़' : 'Ratangarh'}</option>
              <option value="Sardarshahar">{hi ? 'सरदारशहर' : 'Sardarshahar'}</option>
              <option value="Sujangarh">{hi ? 'सुजानगढ़' : 'Sujangarh'}</option>
               <option value="Taranagar">{hi ? 'तारानगर' : 'Taranagar'}</option>

            </select></label>
            <label>{hi ? 'जिला' : 'District'}<input type="text" value={hi ? 'चूरू' : 'Churu'} readOnly /></label>
            <label>{hi ? 'अक्षांश' : 'Latitude'}<input type="text" value={form.latitude} placeholder={hi ? 'अक्षांश' : 'Latitude'} onChange={(event) => updateField('latitude', event.target.value)} /></label>
            <label>{hi ? 'देशांतर' : 'Longitude'}<input type="text" value={form.longitude} placeholder={hi ? 'देशांतर' : 'Longitude'} onChange={(event) => updateField('longitude', event.target.value)} /></label>
            <label>{hi ? 'खेत का कुल क्षेत्रफल' : 'Total Area of Farm'}<input type="number" value={form.area} placeholder={hi ? 'हेक्टेयर में क्षेत्र' : 'Area in hectare'} onChange={(event) => updateField('area', event.target.value)} /></label>
            <label>{hi ? 'मौजूदा तालाब' : 'Existing Ponds'}<input type="number" value={form.ponds} placeholder={hi ? 'तालाबों की संख्या' : 'Number of ponds'} onChange={(event) => updateField('ponds', event.target.value)} /></label>
          </div>
          </div>

          <div className="reg-card">
          <div className="form-section-title">
            <span>03</span>
            <div>
              <h2>{hi ? 'संस्कृति विवरण' : 'Culture Details'}</h2>
              <p>{hi ? 'जल स्रोत, लवणता, प्रजाति और योजना सहायता।' : 'Water source, salinity, species, and scheme assistance.'}</p>
            </div>
          </div>

          <div className="form-grid">
            <label>{hi ? 'जल स्रोत' : 'Source of Water'}<select value={form.waterSource} onChange={(event) => updateField('waterSource', event.target.value)}><option value="" disabled>{hi ? 'स्रोत चुनें' : 'Select source'}</option><option value="Tube well">{hi ? 'ट्यूबवेल' : 'Tube well'}</option><option value="Farm reservoir">{hi ? 'फार्म जलाशय' : 'Farm reservoir'}</option><option value="Canal linked source">{hi ? 'नहर से जुड़ा स्रोत' : 'Canal linked source'}</option><option value="Rainwater pond">{hi ? 'वर्षा जल तालाब' : 'Rainwater pond'}</option></select></label>
            <label>{hi ? 'लवणता सीमा' : 'Salinity Range'}<input type="number" value={form.salinity} placeholder={hi ? 'ppt सीमा' : 'ppt range'} onChange={(event) => updateField('salinity', event.target.value)} /></label>
            <label>{hi ? 'प्रस्तावित प्रजाति' : 'Proposed Species'}<select value={form.species} onChange={(event) => updateField('species', event.target.value)}>
              <option value="" disabled>{hi ? 'प्रजाति चुनें' : 'Select species'}</option>
              <option value="P. vannamei">{hi ? 'पी. वन्नामेई (P. vannamei)' : 'P. vannamei'}</option>
              <option value="P. monodon">{hi ? 'पी. मोनोडोन (P. monodon)' : 'P. monodon'}</option>
            </select></label>
            <label>{hi ? 'वित्तीय सहायता प्राप्त' : 'Financial Assistance Availed'}<select value={form.assistance} onChange={(event) => updateField('assistance', event.target.value)}><option value="" disabled>{hi ? 'विकल्प चुनें' : 'Select option'}</option><option value="Yes">{hi ? 'हाँ' : 'Yes'}</option><option value="No">{hi ? 'नहीं' : 'No'}</option></select></label>
          </div>
          </div>

          <div className="reg-card">
          <div className="form-section-title">
            <span>04</span>
            <div>
              <h2>{hi ? 'सहायक दस्तावेज' : 'Supportive Documents'}</h2>
              <p>{hi ? 'अतिरिक्त सहायक दस्तावेज़ चुनें और अपलोड करें।' : 'Select and upload additional supportive documents.'}</p>
            </div>
          </div>

          <div className="form-grid">
            <label>{hi ? 'सहायक दस्तावेज चाहिए?' : 'Require Supportive Documents?'}<select value={form.supportiveDocuments} onChange={(event) => updateField('supportiveDocuments', event.target.value)}><option value="" disabled>{hi ? 'विकल्प चुनें' : 'Select option'}</option><option value="Yes">{hi ? 'हाँ' : 'Yes'}</option><option value="No">{hi ? 'नहीं' : 'No'}</option></select></label>
          </div>

          {form.supportiveDocuments === 'Yes' && (
            <>
              <div className="document-info-panel">
                <p className="eyebrow">{hi ? 'आवश्यक सहायक दस्तावेज़' : 'Required Supportive Documents'}</p>
<label>
  Aadhaar Card
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "aadhaarCard",
        e.target.files[0]
      )
    }
  />
</label>

<label>
  Land Ownership Document
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "landOwnershipDocument",
        e.target.files[0]
      )
    }
  />
</label>
<label>
  Patwari Report
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "patwariReport",
        e.target.files[0]
      )
    }
  />
</label>
                
<label>
  Water Quality Report
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "waterQualityTestReport",
        e.target.files[0]
      )
    }
  />
</label>

<label>
  Pond Photograph
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "pondPhotograph",
        e.target.files[0]
      )
    }
  />
</label>

<label>
  Farmer Photograph
  <input
    type="file"
    accept=".pdf,.jpg,.png"
    onChange={(e) =>
      updateField(
        "farmerPhotograph",
        e.target.files[0]
      )
    }
  />
</label>



{form.otherDocuments.map((file, index) => (
  <label key={index}>
    {hi ? `अन्य सहायक दस्तावेज़ ${index + 1}` : `Other Supportive Document ${index + 1}`}
    <input
      type="file"
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={(e) => {
        const selectedFile = e.target.files[0] || null;
        setForm((current) => {
          const updated = [...current.otherDocuments];
          updated[index] = selectedFile;
          if (selectedFile && index === current.otherDocuments.length - 1) {
            updated.push(null);
          }
          return { ...current, otherDocuments: updated };
        });
      }}
    />
  </label>
))}
              </div>
            </>
          )}
          </div>

          <div className="form-footer">
<label className="declaration">
  <input
    type="checkbox"
    required
    checked={form.declaration}
    onChange={(event) =>
      updateField(
        "declaration",
        event.target.checked
      )
    }
  />

  <span>
    मैं घोषणा करता/करती हूँ कि इस आवेदन पत्र में मेरे द्वारा दी गई समस्त जानकारी एवं अपलोड किए गए सभी दस्तावेज मेरे ज्ञान एवं विश्वास के अनुसार पूर्णतः सत्य, सही एवं प्रमाणिक हैं। यदि भविष्य में कोई जानकारी अथवा दस्तावेज असत्य अथवा भ्रामक पाए जाते हैं, तो मेरा आवेदन निरस्त किया जा सकता है तथा विभाग द्वारा नियमानुसार कार्यवाही की जा सकती है।
  </span>
</label>
            <button type="submit" className="primary-btn" disabled={isSubmitting}>{isSubmitting ? (hi ? 'जमा कर रहे हैं...' : 'Submitting...') : (hi ? 'आवेदन जमा करें' : 'Submit Application')}</button>
          </div>
          {message && <p className="form-message">{message}</p>}
        </form>

        <aside className="sticky-card">
          <p className="eyebrow">{hi ? 'आवश्यक दस्तावेज' : 'Required Documents'}</p>
          <h2>{hi ? 'दस्तावेज सूची' : 'Documents Needed'}</h2>
          <div className="checklist-scroll">
            {documents.map((doc) => (
              <p key={doc.name}>✓ {hi ? doc.nameHi : doc.name}</p>
            ))}
          </div>
          {notifications.length > 0 && (
            <div className="notification-stack">
              <h3>{hi ? 'आपकी सूचनाएं' : 'Your Notifications'}</h3>
              {notifications.slice(0, 4).map((notification) => (
                <article key={notification.id}>
                  <strong>{notification.applicationId}</strong>
                  <p>{hi ? notification.messageHi : notification.message}</p>
                  <small>{notification.createdAt}</small>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
    </>
  )
}

export default RegistrationPage
