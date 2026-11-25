import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Assessment = {
  age: string
  cycle: string
  periodInterval: string
  symptoms: string[]
  familyHistory: string
  activity: string
  sleep: string
  notes: string
}

const initialAssessment: Assessment = {
  age: '',
  cycle: '',
  periodInterval: '',
  symptoms: [],
  familyHistory: '',
  activity: '',
  sleep: '',
  notes: '',
}

const STORAGE_KEY = 'pcos-intelligence-assessment-v1'

const symptomOptions = [
  'Irregular periods',
  'Acne or oily skin',
  'Unwanted facial or body hair',
  'Hair thinning or hair loss',
  'Weight changes',
  'Darkened skin patches',
]

const steps = [
  'Personal information',
  'Clinical assessment',
  'Lifestyle',
]

function App() {
  const [assessment, setAssessment] =
    useState<Assessment>(initialAssessment)

  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasDraft, setHasDraft] = useState(false)
  const [notice, setNotice] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed = JSON.parse(saved) as Assessment

        if (
          parsed &&
          typeof parsed === 'object' &&
          Array.isArray(parsed.symptoms)
        ) {
          setAssessment({ ...initialAssessment, ...parsed })
          setHasDraft(true)
        }
      }
    } catch {
      setHasDraft(false)
    }
  }, [])

  const updateField = <K extends keyof Assessment>(
    field: K,
    value: Assessment[K],
  ) => {
    setAssessment((previous) => ({
      ...previous,
      [field]: value,
    }))
    setNotice('')
  }

  const toggleSymptom = (symptom: string) => {
    setAssessment((previous) => {
      const exists = previous.symptoms.includes(symptom)

      return {
        ...previous,
        symptoms: exists
          ? previous.symptoms.filter((item) => item !== symptom)
          : [...previous.symptoms, symptom],
      }
    })

    setNotice('')
  }

  const startAssessment = () => {
    setAssessment(initialAssessment)
    setCurrentStep(0)
    setAssessmentOpen(true)
    setCompleted(false)
    setNotice('')
  }

  const resumeAssessment = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (!saved) {
        setNotice('No saved assessment was found on this device.')
        return
      }

      const parsed = JSON.parse(saved) as Assessment

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !Array.isArray(parsed.symptoms)
      ) {
        setNotice('The saved draft could not be read.')
        return
      }

      setAssessment({ ...initialAssessment, ...parsed })
      setCurrentStep(0)
      setAssessmentOpen(true)
      setCompleted(false)
      setNotice('Your saved assessment has been restored.')
    } catch {
      setNotice('Unable to restore the saved draft.')
    }
  }

  const saveProgress = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment))
      setHasDraft(true)
      setNotice('Your assessment draft has been saved on this device.')
    } catch {
      setNotice('Unable to save. Please check your browser storage.')
    }
  }

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      const age = Number(assessment.age)

      if (
        !assessment.age ||
        !Number.isInteger(age) ||
        age < 18 ||
        age > 100
      ) {
        setNotice('Please enter a valid age between 18 and 100.')
        return false
      }
    }

    if (currentStep === 1 && !assessment.cycle) {
      setNotice('Please select your menstrual cycle pattern.')
      return false
    }

    if (
      currentStep === 2 &&
      (!assessment.activity || !assessment.sleep || !assessment.familyHistory)
    ) {
      setNotice('Please complete all required lifestyle and history fields.')
      return false
    }

    setNotice('')
    return true
  }

  const goNext = () => {
    if (!validateCurrentStep()) return

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  const goBack = () => {
    setNotice('')
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const submitAssessment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateCurrentStep()) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment))
      setHasDraft(true)
      setCompleted(true)
      setNotice('')
    } catch {
      setNotice('Unable to save your assessment. Please try again.')
    }
  }

  const closeAssessment = () => {
    setAssessmentOpen(false)
    setCompleted(false)
    setNotice('')
  }

  return (
    <main className="app">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="PCOS Intelligence home">
          <span className="brand-icon" aria-hidden="true">
            P
          </span>

          <span>
            <strong>PCOS Intelligence</strong>
            <small>HEALTH & WELLNESS</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#process">How it works</a>
          <a href="#safety">Safety</a>
        </nav>

        <button
          className="button button-primary nav-cta"
          onClick={startAssessment}
          type="button"
        >
          Start assessment
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            YOUR HEALTH, YOUR JOURNEY
          </div>

          <h1>
            Understand your health.
            <br />
            <span>Take the next step.</span>
          </h1>

          <p className="hero-description">
            A guided PCOS-related health assessment designed to help
            you organize your symptoms, understand your health history,
            and prepare for a conversation with a healthcare professional.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary button-large"
              onClick={startAssessment}
              type="button"
            >
              Start assessment <span aria-hidden="true">→</span>
            </button>

            <button
              className="button button-secondary button-large"
              onClick={resumeAssessment}
              type="button"
            >
              {hasDraft ? 'Resume saved assessment' : 'Resume assessment'}
            </button>
          </div>

          {notice && !assessmentOpen && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}

          <div className="trust-row">
            <span><span aria-hidden="true">✓</span> Guided questionnaire</span>
            <span><span aria-hidden="true">✓</span> Save your progress</span>
            <span><span aria-hidden="true">✓</span> Clear health information</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Health and wellness illustration">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="health-card">
            <div className="health-card-top">
              <div>
                <span className="card-overline">YOUR HEALTH SPACE</span>
                <h2>Every step matters.</h2>
              </div>

              <div className="heart-icon" aria-hidden="true">♡</div>
            </div>

            <div className="illustration">
              <div className="illustration-circle circle-back" />
              <div className="illustration-circle circle-front" />

              <div className="person-illustration">
                <div className="person-hair" />
                <div className="person-head" />
                <div className="person-neck" />
                <div className="person-body" />
                <div className="person-arm arm-left" />
                <div className="person-arm arm-right" />
              </div>

              <span className="floating-symbol symbol-one" aria-hidden="true">✳</span>
              <span className="floating-symbol symbol-two" aria-hidden="true">+</span>
              <span className="floating-symbol symbol-three" aria-hidden="true">✦</span>
            </div>

            <div className="visual-caption">
              <span className="caption-icon" aria-hidden="true">♡</span>
              <div>
                <strong>Personalized health journey</strong>
                <p>Start with what you know.</p>
              </div>
              <span className="caption-arrow" aria-hidden="true">↗</span>
            </div>
          </div>

          <div className="floating-note note-top">
            <span className="note-icon lavender" aria-hidden="true">✳</span>
            <span>
              <strong>Know your symptoms</strong>
              <small>Build awareness</small>
            </span>
          </div>

          <div className="floating-note note-bottom">
            <span className="note-icon mint" aria-hidden="true">✓</span>
            <span>
              <strong>Your progress</strong>
              <small>Save and continue later</small>
            </span>
          </div>
        </div>
      </section>

      <section className="benefits section-container" id="features">
        <div className="section-heading">
          <span className="section-label">BUILT AROUND YOU</span>
          <h2>A more informed approach to PCOS</h2>
          <p>
            Simple tools to help you document your health information
            and prepare for the next step.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon icon-purple" aria-hidden="true">♡</div>
            <h3>Clinical assessment</h3>
            <p>
              Record menstrual cycle patterns, symptoms, and relevant
              health history in one guided questionnaire.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon icon-green" aria-hidden="true">✳</div>
            <h3>AI-ready insights</h3>
            <p>
              Prepare structured health information for future analysis.
              No AI prediction is made unless a validated model is integrated.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon icon-peach" aria-hidden="true">↗</div>
            <h3>Personalized progress</h3>
            <p>
              Save your draft on this device and return to your
              questionnaire when you are ready.
            </p>
          </article>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="section-container process-inner">
          <div className="section-heading">
            <span className="section-label">A SIMPLE PROCESS</span>
            <h2>Three steps to get started</h2>
            <p>
              Take your time. You can save your progress along the way.
            </p>
          </div>

          <div className="process-grid">
            {steps.map((step, index) => (
              <article className="process-card" key={step}>
                <span className="process-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{step}</h3>
                <p>
                  {index === 0 &&
                    'Enter your age and begin your health questionnaire.'}
                  {index === 1 &&
                    'Document your cycle patterns and relevant symptoms.'}
                  {index === 2 &&
                    'Add lifestyle information and save your responses.'}
                </p>
              </article>
            ))}
          </div>

          <button
            className="button button-primary button-large"
            onClick={startAssessment}
            type="button"
          >
            Begin your assessment <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className="safety-section section-container" id="safety">
        <div className="safety-icon" aria-hidden="true">+</div>
        <div>
          <h2>Your health deserves informed care.</h2>
          <p>
            This platform is an educational and information-organizing tool.
            It does not diagnose PCOS, replace a medical examination, or
            provide emergency care. Consult a qualified healthcare
            professional for assessment and treatment.
          </p>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon" aria-hidden="true">P</span>
          <span>
            <strong>PCOS Intelligence</strong>
            <small>HEALTH & WELLNESS</small>
          </span>
        </a>

        <p>Designed to support informed healthcare decisions.</p>
        <span>© {new Date().getFullYear()} PCOS Intelligence Platform</span>
      </footer>

      {assessmentOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAssessment()
            }
          }}
        >
          <section
            className="assessment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assessment-title"
          >
            <div className="modal-header">
              <div>
                <span className="section-label">YOUR HEALTH JOURNEY</span>
                <h2 id="assessment-title">
                  {completed ? 'Assessment saved' : 'Clinical assessment'}
                </h2>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={closeAssessment}
                aria-label="Close assessment"
              >
                ×
              </button>
            </div>

            {completed ? (
              <div className="completion-panel">
                <div className="completion-icon" aria-hidden="true">✓</div>
                <h3>Your responses have been saved.</h3>
                <p>
                  Your questionnaire is stored in this browser on this
                  device. This is not a PCOS diagnosis or an AI-generated
                  medical prediction.
                </p>

                <button
                  className="button button-primary button-large"
                  type="button"
                  onClick={closeAssessment}
                >
                  Return to home
                </button>
              </div>
            ) : (
              <>
                <div className="step-indicator">
                  <div className="step-track">
                    <div
                      className="step-fill"
                      style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="step-labels">
                    <span>
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <span>{steps[currentStep]}</span>
                  </div>
                </div>

                <form onSubmit={submitAssessment}>
                  {currentStep === 0 && (
                    <div className="form-step">
                      <h3>Let's start with the basics.</h3>
                      <p className="form-description">
                        Only enter information you are comfortable sharing.
                      </p>

                      <label className="form-label" htmlFor="age">
                        Age <span className="required">*</span>
                      </label>

                      <input
                        id="age"
                        className="form-input"
                        type="number"
                        min="18"
                        max="100"
                        value={assessment.age}
                        onChange={(event) =>
                          updateField('age', event.target.value)
                        }
                        placeholder="Enter your age"
                        required
                      />

                      <p className="field-help">
                        This questionnaire is intended for adults aged 18
                        and over.
                      </p>

                      <div className="privacy-note">
                        <span aria-hidden="true">🔒</span>
                        <p>
                          Responses are saved in this browser only. They are
                          not sent to a server by this demo.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="form-step">
                      <h3>Tell us about your menstrual cycle.</h3>
                      <p className="form-description">
                        These answers help organize information for a
                        healthcare professional.
                      </p>

                      <fieldset className="form-fieldset">
                        <legend>
                          How would you describe your cycle?
                          <span className="required"> *</span>
                        </legend>

                        {[
                          ['regular', 'Generally regular'],
                          ['irregular', 'Irregular or unpredictable'],
                          ['absent', 'Periods have stopped or are absent'],
                          ['unsure', 'Not sure / prefer not to say'],
                        ].map(([value, label]) => (
                          <label className="radio-option" key={value}>
                            <input
                              type="radio"
                              name="cycle"
                              value={value}
                              checked={assessment.cycle === value}
                              onChange={() =>
                                updateField('cycle', value)
                              }
                              required
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </fieldset>

                      <label
                        className="form-label"
                        htmlFor="periodInterval"
                      >
                        Typical number of days between periods
                      </label>

                      <select
                        id="periodInterval"
                        className="form-input"
                        value={assessment.periodInterval}
                        onChange={(event) =>
                          updateField('periodInterval', event.target.value)
                        }
                      >
                        <option value="">Select if known</option>
                        <option value="under21">Less than 21 days</option>
                        <option value="21-35">21–35 days</option>
                        <option value="over35">More than 35 days</option>
                        <option value="varies">Varies significantly</option>
                        <option value="unknown">Not sure</option>
                      </select>

                      <fieldset className="form-fieldset">
                        <legend>Have you noticed any of these symptoms?</legend>
                        <p className="field-help">
                          Select any that apply. You may leave this blank.
                        </p>

                        <div className="symptom-grid">
                          {symptomOptions.map((symptom) => (
                            <label className="checkbox-option" key={symptom}>
                              <input
                                type="checkbox"
                                checked={assessment.symptoms.includes(symptom)}
                                onChange={() => toggleSymptom(symptom)}
                              />
                              <span>{symptom}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="form-step">
                      <h3>Complete your health profile.</h3>
                      <p className="form-description">
                        Lifestyle details provide context, but cannot
                        diagnose PCOS on their own.
                      </p>

                      <label
                        className="form-label"
                        htmlFor="familyHistory"
                      >
                        Family history of PCOS or related hormonal conditions
                        <span className="required"> *</span>
                      </label>

                      <select
                        id="familyHistory"
                        className="form-input"
                        value={assessment.familyHistory}
                        onChange={(event) =>
                          updateField('familyHistory', event.target.value)
                        }
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Not sure</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>

                      <label className="form-label" htmlFor="activity">
                        Usual physical activity
                        <span className="required"> *</span>
                      </label>

                      <select
                        id="activity"
                        className="form-input"
                        value={assessment.activity}
                        onChange={(event) =>
                          updateField('activity', event.target.value)
                        }
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="low">Mostly sitting / limited activity</option>
                        <option value="moderate">Some activity each week</option>
                        <option value="high">Regular physical activity</option>
                        <option value="varies">Varies from week to week</option>
                      </select>

                      <label className="form-label" htmlFor="sleep">
                        Typical sleep duration
                        <span className="required"> *</span>
                      </label>

                      <select
                        id="sleep"
                        className="form-input"
                        value={assessment.sleep}
                        onChange={(event) =>
                          updateField('sleep', event.target.value)
                        }
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="under6">Less than 6 hours</option>
                        <option value="6-8">6–8 hours</option>
                        <option value="over8">More than 8 hours</option>
                        <option value="varies">Varies significantly</option>
                      </select>

                      <label className="form-label" htmlFor="notes">
                        Additional notes (optional)
                      </label>

                      <textarea
                        id="notes"
                        className="form-input form-textarea"
                        rows={4}
                        maxLength={1000}
                        value={assessment.notes}
                        onChange={(event) =>
                          updateField('notes', event.target.value)
                        }
                        placeholder="Anything else you would like to discuss with your healthcare professional?"
                      />

                      <p className="field-help">
                        Avoid entering your name, contact details, or other
                        personally identifying information in these notes.
                      </p>
                    </div>
                  )}

                  {notice && (
                    <p className="form-notice" role="alert">
                      {notice}
                    </p>
                  )}

                  <div className="form-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={saveProgress}
                    >
                      Save progress
                    </button>

                    <div className="form-navigation">
                      {currentStep > 0 && (
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={goBack}
                        >
                          Back
                        </button>
                      )}

                      {currentStep < steps.length - 1 ? (
                        <button
                          className="button button-primary"
                          type="button"
                          onClick={goNext}
                        >
                          Continue →
                        </button>
                      ) : (
                        <button
                          className="button button-primary"
                          type="submit"
                        >
                          Save assessment ✓
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default App