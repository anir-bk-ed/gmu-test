// Sci4Pol Quiz Application - React Components

const { useState, useEffect } = React;

// Quiz Data - Load from external JSON file
let quizData = {};

// Load quiz data from external JSON file
const loadQuizData = async () => {
    try {
        const response = await fetch('quizData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        quizData = await response.json();

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Randomize questions if option is set in quizData.json
        if (quizData.randomizeQuestions) {
            shuffleArray(quizData.questions);
        }

        // Randomize options within each question if option is set in quizData.json
        if (quizData.randomizeOptions) {
            quizData.questions.forEach(question => {
                if (question.options && question.options.length > 0) {
                    shuffleArray(question.options);
                }
            });
        }

        console.log('Quiz data loaded successfully');
    } catch (error) {
        console.error('Error loading quiz data:', error);
        // Fallback: Use basic structure if JSON fails to load
        quizData = {
            title: "Communicating Science for Policy",
            subtitle: "COVID-19 and the Summer Festival",
            questions: [],
            outcomes: {},
            competencies: []
        };
    }
};

// Initialize quiz data on page load
loadQuizData();

// Answer Tracking System
class AnswerTracker {
    constructor() {
        this.answers = {};
        this.questionScores = {}; // Track cumulative score for each question
        this.questionAttempts = {}; // Track which answers have been tried for each question
        this.currentPath = [];
        this.score = 0;
        this.competencyScores = {
            support_decision_making: { score: 0, maxScore: 0, questions: 0 },
            covid_evidence: { score: 0, maxScore: 0, questions: 0 },
            navigate_tensions: { score: 0, maxScore: 0, questions: 0 }
        };
    }

    recordAnswer(questionId, answerId) {
        // Calculate score for this answer
        let questionScore = 0;
        if (answerId.endsWith('a')) questionScore = 10;
        else if (answerId.endsWith('b')) questionScore = 7;
        else questionScore = -4;

        // Initialize tracking for this question if not exists
        if (!this.questionAttempts[questionId]) {
            this.questionAttempts[questionId] = new Set();
            this.questionScores[questionId] = 0;
        }

        // Only add score if this specific answer hasn't been tried before
        if (!this.questionAttempts[questionId].has(answerId)) {
            this.questionScores[questionId] += questionScore;
            this.questionAttempts[questionId].add(answerId);
        }

        this.answers[questionId] = answerId;
        this.currentPath.push(answerId);
        this.calculateScore();
    }

    calculateScore() {
        let totalScore = 0;

        // Reset competency scores
        Object.keys(this.competencyScores).forEach(comp => {
            this.competencyScores[comp] = { score: 0, maxScore: 0, questions: 0 };
        });

        // Calculate scores using cumulative scores for each question
        Object.entries(this.questionScores).forEach(([questionId, questionScore]) => {
            totalScore += questionScore;

            // Find the question's competency and add to competency score
            const question = quizData.questions.find(q => q.id == questionId);
            if (question && this.competencyScores[question.competency]) {
                this.competencyScores[question.competency].score += questionScore;
                this.competencyScores[question.competency].maxScore += 10; // Max possible score per question
                this.competencyScores[question.competency].questions += 1;
            }
        });

        this.score = totalScore;
    }

    getAnswerPath() {
        return this.currentPath.join(' -> ');
    }

    getCompetencyPercentage(competency) {
        const comp = this.competencyScores[competency];
        if (comp.questions === 0) return 0;

        // Simple percentage calculation: (score / max_possible) * 100
        // Where max_possible = questions * 10 (optimal score per question)
        const maxPossibleScore = comp.questions * 10;
        const percentage = Math.round((comp.score / maxPossibleScore) * 100);

        // Ensure percentage is between 0 and 100
        return Math.max(0, Math.min(100, percentage));
    }

    getOverallPercentage() {
        const totalQuestions = Object.keys(this.questionScores).length;
        if (totalQuestions === 0) return 0;

        // Simple percentage calculation: (total_score / max_possible) * 100
        // Where max_possible = total_questions * 10 (optimal score per question)
        const maxPossibleScore = totalQuestions * 10;
        const percentage = Math.round((this.score / maxPossibleScore) * 100);

        // Ensure percentage is between 0 and 100
        return Math.max(0, Math.min(100, percentage));
    }

    getResults() {
        return {
            answers: this.answers,
            questionScores: this.questionScores,
            questionAttempts: this.questionAttempts,
            path: this.currentPath,
            score: this.score,
            totalQuestions: Object.keys(this.questionScores).length,
            overallPercentage: this.getOverallPercentage(),
            competencyScores: this.competencyScores,
            competencyPercentages: {
                support_decision_making: this.getCompetencyPercentage('support_decision_making'),
                covid_evidence: this.getCompetencyPercentage('covid_evidence'),
                navigate_tensions: this.getCompetencyPercentage('navigate_tensions')
            }
        };
    }

    // Reset all tracking data for replay scenario
    reset() {
        this.answers = {};
        this.questionScores = {};
        this.questionAttempts = {};
        this.currentPath = [];
        this.score = 0;
        this.competencyScores = {
            support_decision_making: { score: 0, maxScore: 0, questions: 0 },
            covid_evidence: { score: 0, maxScore: 0, questions: 0 },
            navigate_tensions: { score: 0, maxScore: 0, questions: 0 }
        };
    }
}

// Initialize answer tracker
const answerTracker = new AnswerTracker();

// Header Component - Simplified to match design requirements
const Header = () => {
    return (
        <header className="header" style={{ display: 'none' }}>
            {/* Header removed as requested - PageHeader component handles all screen headers */}
        </header>
    );
};

// Standardized Page Header Component for consistent styling across screens
const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="mainheader">

                <div className="headerBlock">

                    <div className="logodiv">
                        <img
                            src="assets/SC4_logo.png"
                            alt="Sci4Pol Logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = 'Sci4Pol';
                            }}
                        />
                    </div>


                    <div className="titlediv">
                        {title} <span>|</span>
                        {subtitle && (
                            <span className="subtitlediv"> {subtitle}</span>
                        )}
                    </div>


            </div>
        </div>
    );
};

// Progress Bar Component
const ProgressBar = ({ current, total }) => {
    const progress = (current / total) * 100;

    return (
        <div className="progress-container">
            <div className="container">
                <div className="progress-custom">
                    <div
                        className="progress-bar-custom"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-center mt-2">
                    <small className="text-light">Question {current} of {total}</small>
                </div>
            </div>
        </div>
    );
};

// Welcome Screen Component
const WelcomeScreen = ({ onStart }) => {
    return (
        <div className="welcome-screen">
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="top-content">
                        <div className="left-top-section">
                            <div className="logo-section">
                                <img
                                    src="assets/SC4_logo.png"
                                    alt="Sci4Pol Logo"
                                    className="main-logo"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="logo-fallback" style={{display: 'none'}}>
                                    Sci4Pol
                                </div>
                            </div>
                            <div className="main-title-section">
                                <h1 className="main-title">COMMUNICATING <span>SCIENCE FOR POLICY</span></h1>
                            </div>
                        </div>
                        <div className="right-top-section">
                            <p className="program-info">Online Certificate Program<br/>Summer 2025</p>
                        </div>
                    </div>

                    <div className="bottom-content">
                        <div className="scenario-info">
                            <span>Branching Scenario</span>
                            <h4 className="scenario-title">COVID-19 and the Summer Festival</h4>
                        </div>
                            <button
                                className="continue-btn"
                                onClick={onStart}
                            >
                                Continue
                            </button>

                    </div>
                </div>

                <div className="partner-footer">
                    <img
                        src="assets/partner.png"
                        alt="Partner Organizations"
                        className="partner-logos"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            </div>
        </div>
    );
};

// Introduction/Setting the Stage Screen Component
const IntroductionScreen = ({ onContinue }) => {
    return (
        <div className="introduction-screen">
            <PageHeader title="INTRODUCTION" subtitle="SETTING THE STAGE" />

            <div className="intro-content">
                <div className="intro-image-section">
                    <img
                        src="assets/settingBanner.png"
                        alt="Meeting scenario with health officials"
                        className="intro-main-image d-none-mob"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                     <img
                        src="assets/setting_banner_4.png"
                        alt="Meeting scenario with health officials"
                        className="intro-main-image mobImg"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                </div>

                <div className="intro-text-section">
                    <div className="intro-icon">
                        <div className="setting-icon">
                            <img src="assets/setting_icon.png" alt="Setting icon" className="greenBgIcon" />
                        </div>
                    </div>

                    <div className="intro-content-text">
                        <div className="topictitle">The Setting</div>
                        <p>This scenario is set in a mid-sized U.S. city during a period of rising COVID-19 case numbers.</p>
                        <p>You will play the role of a public health scientist at a private university. You have managed to secure a short one-on-one meeting with the city's Mayor, who must decide whether to move forward with the city's large annual summer festival.</p>
                        <p>The event is both culturally meaningful and economically important but presents public health risks if held without precautions.</p>
                        <p className="mar-bottom0">Your goal is to communicate the latest COVID-19-related evidence, navigate policy tensions, and support informed decision-making.</p>
                        <div className="buttondiv">
                        <button
                            className="continue-btn"
                            onClick={onContinue}
                        >
                            Continue
                        </button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Module Structure Screen Component
const ModuleStructureScreen = ({ onContinue }) => {
    return (
        <div className="introduction-screen">
            <PageHeader title="INTRODUCTION" subtitle="SETTING THE STAGE" />

            <div className="intro-content">
                <div className="intro-image-section">
                    <img
                        src="assets/modalStructer.png"
                        alt="Meeting scenario with health officials"
                        className="intro-main-image"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                </div>

                <div className="intro-text-section">
                    <div className="intro-icon">
                        <div className="setting-icon">
                            <img src="assets/setting_module_struture.png" alt="Module structure icon" className="greenBgIcon" />
                        </div>
                    </div>

                    <div className="intro-content-text">
                        <div className="topictitle">The Module Structure</div>
                        <p>The module is designed as a branching scenario with multiple decision points. At each decision point, you will need to choose one of the three options available based on your knowledge and understanding of the situation. Choose wisely as your choice will affect the flow and outcome of the scenario. Making incorrect choices may result in unfavorable outcomes and require you to start over from the last successful decision point.</p>
                        <div className="buttondiv">
                        <button
                            className="continue-btn"
                            onClick={onContinue}
                        >
                            Continue
                        </button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Question Component
const QuestionScreen = ({ question, onAnswer, questionNumber, totalQuestions }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleAnswerSelect = (answerId) => {
        setSelectedAnswer(answerId);
    };

    const handleSubmit = () => {
        if (selectedAnswer) {
            answerTracker.recordAnswer(question.id, selectedAnswer);
            onAnswer(selectedAnswer);
        }
    };

    // Get banner image based on decision point
    const getBannerImage = (questionId) => {
        const bannerImages = {
            1: "assets/banner_decision_point_1.png",
            2: "assets/decisionPt3-1.png",
            3: "assets/decisionPt3-2.png",
            4: "assets/decisionPt3-3.png",
            5: "assets/decisionPt3-4.png",
            6: "assets/decisionPt3-5.png"

        };
        return bannerImages[questionId] || bannerImages[1];
    };

    // Get Mob banner image based on decision point
    const getBannerMobImage = (questionId) => {
        const bannerMobImages = {
            1: "assets/Sl_4_3.png",
            2: "assets/decisionPt3-1-mobile.png",
            3: "assets/decisionPt3-3-mob.png",
            4: "assets/decisionPt3-4-mob.png",
            5: "assets/decisionPt3-1-mobile.png",
            6: "assets/decisionPt3-1-mobile.png"

        };
        return bannerMobImages[questionId] || bannerMobImages[1];
    };

    // Get alert icon based on decision point
    const getAlertIcon = (questionId) => {
        const alertIcons = {
            1: "assets/alert_icon_dp_1_lg.png",
            2: "assets/alert_icon_dp_2.png",
            3: "assets/alert_icon_dp_3_lg.png",
            4: "assets/alert_icon_dp_4_lg.png",
            5: "assets/alert_icon_dp_5.png",
            6: "assets/alert_icon_dp_6.png"
        };
        return alertIcons[questionId] || alertIcons[1];
    };

    // Get competency info
    const competency = quizData.competencies.find(c => c.id === question.competency);
    const competencyName = competency ? competency.name.toUpperCase() : '';

    return (
        <div className="question-page">
            <PageHeader
                title={`DECISION POINT ${questionNumber}`}
                subtitle={question.title}
            />

            {/* Banner Section */}
            <div className="intro-content">
                <div className="intro-image-section">
                    <img
                        // src="assets/banner_decision_point_1.png"
                        src={getBannerImage(question.id)}
                        alt="Meeting scenario with health officials"
                        className="intro-main-image d-none-mob"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                      <img
                         src={getBannerMobImage(question.id)}
                        alt="Meeting scenario with health officials"
                        className="intro-main-image mobImg"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />
                    {/* Overlay */}

                    {/* Alert Box on Right Side */}
                    {question.context && (
                        <div className="bannercontent">
                            <img src={getAlertIcon(question.id)}
                                alt="Alert Icon" onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<i class="fas fa-users" style="font-size: 1.5rem; color: white;"></i>';
                                }}

                            />
                            <div dangerouslySetInnerHTML={{ __html: question.context }} />

                        </div>
                    )}
                </div>


            {/* Content Section */}
            <div className="question-content">

                    {/* Question Section */}
                    <div className="question-section">
                    <div className="row">
                        <div className="col-md-12">
                        <p className="question-text" >
                            {question.question}
                        </p>
                        <p className="instruction-text">
                            {question.instruction}
                        </p>
                        </div>
                        </div>
                    </div>

                    {/* Answer Options */}
                    <div className="answer-options-section">
                        <div className="row">
                            {question.options.map((option, index) => (
                                <div key={option.id} className="col-md-4 mb-3">
                                    <div
                                        className={`answer-card ${selectedAnswer === option.id ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(option.id)}>
                                        <div className="option-text">
                                            {option.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="text-center">
                        <button
                            className="continue-btn"
                            onClick={handleSubmit}
                            disabled={!selectedAnswer}>
                            Continue
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Outcome Screen Component
const OutcomeScreen = ({ outcomeId, onContinue, questionNumber }) => {
    const outcome = quizData.outcomes[outcomeId];

    const getStatusIcon = (type) => {
        switch(type) {
            case 'optimal':
                return {
                    icon: (
                        <div className="upicon">
                            <img src="assets/great_decision.png" alt="Great decision" />
                        </div>
                    ),
                    class: 'optimal',
                    title: 'Great decision!'
                };
            case 'sub-optimal':
                return {
                    icon: (
                        <div className="upicon">
                            <img src="assets/good_choice.png" alt="Good choice, but not the best." />
                        </div>
                    ),
                    class: 'sub-optimal',
                    title: 'Good choice, but not the best.'
                };
            case 'non-optimal':
                return {
                    icon: (
                        <div className="upicon">
                            <img src="assets/not_good_choice.png" alt="Not a good choice." />
                        </div>
                    ),
                    class: 'non-optimal',
                    title: 'Not a good choice.'
                };
            default:
                return {
                    icon: (
                        <div className="upicon">
                            <img src="assets/info.png" alt="Information" />
                        </div>
                    ),
                    class: 'info',
                    title: 'Information'
                };
        }
    };

    const statusInfo = getStatusIcon(outcome.type);

    return (
        <div style={{ minHeight: '100vh', background: '#001094' }}>
            <PageHeader
                title={`DECISION POINT ${questionNumber}`}
                subtitle="OUTCOME"
            />

            {/* Banner Section */}
            <div className="intro-content">


                <div className="intro-image-section">
                <img
                        src="assets/banner_outcome.png"
                        alt="Meeting scenario with health officials"
                        className="intro-main-image"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                        }}
                    />


                </div>


            {/* Content Section */}
            <div className="intro-text-section">
                <div className="contentdiv">

                        {/* Status Icon Column */}
                        <div className="intro-icon intro-icon1 mobTitltOutcome">
                            {statusInfo.icon} <div className="topictitle topictitle1 mobTitle">{statusInfo.title}</div>
                        </div>

                        {/* Content Column */}
                        <div className="intro-content-text">
                            <div className="topictitle topictitle1 d-none-mob">{statusInfo.title}</div>
                            <div>
                                <div dangerouslySetInnerHTML={{ __html: outcome.message }} />
                            </div>



                    </div>

                    </div>
                       {/* Button */}
                       <div className="buttondiv">
                                {outcome.type === 'non-optimal' ? (
                                    <button className="continue-btn"
                                        onClick={() => onContinue('retry')}
                                    >
                                        Go Back and Retry
                                    </button>
                                ) : (
                                    <button className="continue-btn"
                                        onClick={() => onContinue('next')}
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>
                 </div>
            </div>
        </div>
    );
};

// Results Screen Component
const ResultsScreen = ({ results, onRestart, onExit }) => {
    // Use the overall percentage from results
    const overallPercentage = results.overallPercentage || 0;

    // Get performance badge based on score
    const getPerformanceBadge = (percentage) => {
        if (percentage == 100) {
            return {
                title: 'Well Done',
                image: 'assets/badge_well_done.png',
                icon: '👑' // Crown icon for excellent performance
            };
        } else if (percentage >=80) {
            return {
                title: 'Good Job',
                image: 'assets/badge_good_job.png',
                icon: '⚡' // Lightning bolt for good performance
            };
        }
        else if (percentage >=50) {
            return {
                title: 'Almost There',
                image: 'assets/badge_almost_there.png',
                icon: '⚡' // Lightning bolt for good performance
            };
        } else {
            return {
                title: 'Worth a Retry',
                image: 'assets/badge_retry.png',
                icon: '💪' // Flexed bicep for needs improvement
            };
        }
    };

    const performanceBadge = getPerformanceBadge(overallPercentage);

    // Use actual competency scores from results
    const competencyScores = {
        'Supporting Informed Decision-Making': results.competencyPercentages?.support_decision_making || 0,
        'Communicating COVID-19-Related Evidence': results.competencyPercentages?.covid_evidence || 0,
        'Navigating Policy Tensions': results.competencyPercentages?.navigate_tensions || 0
    };

    return (
        <div className="results-container">
            <PageHeader title="CONCLUSION" subtitle="REFLECTION TIME" />

            {/* Main Content Section */}
            <div className="results-main-content">
                <div className="container-fluid results-container-fluid">
                    <div className="row results-row">
                        {/* Left Column - Festival Image */}
                        <div className="col-md-5 results-image-column">
                            <img src="assets/result_banner.png" />
                            <div className="results-badge-container">
                                <div className="results-performance-badge">
                                    <img
                                        src={performanceBadge.image}
                                        alt={performanceBadge.title}
                                        className="results-badge-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '🏆';
                                        }}
                                    />
                                </div>
                            </div>
                            {/* Optional overlay for better contrast */}
                            {/* <div className="results-image-overlay"></div> */}
                        </div>

                        {/* Right Column - Results Content */}
                        <div className="col-md-7 results-content-column">
                            {/* Performance Badge - Positioned at the border */}


                            {/* Content with top margin to account for badge */}
                            <div className="results-content-wrapper">
                                <h2 className="results-title">
                                    {performanceBadge.title}
                                </h2>
                            </div>

                            {/* Content Text */}
                            <div className="results-description">
                                <p className="results-description-text">
                                    You have reached the end of the scenario. This scenario focused on three key competencies—Communicating COVID-19-Related Evidence, Navigating Policy Tensions, and Supporting Informed Decision-Making.
                                </p>

                                <p className="results-description-text">
                                    Given below is an analysis of your overall and competency-based performance based on the decisions you made in the scenario.
                                </p>
                            </div>

                            {/* Overall Score */}
                            <div className="results-score-section">
                                <p className="results-overall-score">
                                    Your Overall Score is: <span className="results-score-value">{overallPercentage}%</span>
                                </p>
                                <p className="results-competency-label">
                                    Your Competency-Based Scores are:
                                </p>
                            </div>

                            {/* Competency Scores Table */}
                            <div className="results-table-container">
                                <table className="results-table">
                                    <tbody>
                                        {Object.entries(competencyScores).map(([competency, score]) => (
                                            <tr key={competency}>
                                                <td className="results-table-cell">
                                                    {competency}
                                                </td>
                                                <td className="results-table-score">
                                                    {score}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Reflection Text */}
                            <div className="results-reflection">
                                <p className="results-reflection-text">
                                    Take a moment to reflect on your decisions. Could you have done anything differently?
                                </p>
                                <p className="results-reflection-text">
                                    You can always go back and replay the scenario to explore the outcomes for other options.
                                </p>
                            </div>

                            {/* Action Buttons - Bottom Right */}
                            <div className="results-action-buttons">
                                <button
                                    className="btn btn-outline-primary results-btn-replay"
                                    onClick={() => onRestart()}
                                >
                                    Replay Scenario
                                </button>
                                <button
                                    className="btn btn-secondary results-btn-exit"
                                    onClick={() => onExit()}
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [lastAnswer, setLastAnswer] = useState(null);

    const handleStart = () => {
        setCurrentScreen('introduction');
    };

    const handleIntroductionContinue = () => {
        setCurrentScreen('moduleStructure');
    };

    const handleModuleStructureContinue = () => {
        setCurrentScreen('question');
        setCurrentQuestionIndex(0);
    };

    const handleAnswer = (answerId) => {
        setLastAnswer(answerId);
        setCurrentScreen('outcome');
    };

    const handleOutcomeContinue = (action) => {
        if (action === 'retry') {
            // Go back to the same question
            setCurrentScreen('question');
        } else if (action === 'next') {
            // Move to next question or results
            if (currentQuestionIndex < quizData.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentScreen('question');
            } else {
                setCurrentScreen('results');
            }
        }
    };

    const handleRestart = () => {
        setCurrentScreen('introduction');
        setCurrentQuestionIndex(0);
        setLastAnswer(null);
        // Reset answer tracker using the new reset method
        answerTracker.reset();
    };

    const handleExit = () => {
        // Close the application or redirect to a different page
        if (window.confirm('Are you sure you want to exit the quiz?')) {
            // You can customize this behavior based on your needs:
            // Option 1: Close the window/tab (may not work in all browsers)
            window.close();

            // Option 2: Redirect to a different page
            // window.location.href = 'https://your-exit-page.com';

            // Option 3: Reset to welcome screen
            setCurrentScreen('welcome');
            setCurrentQuestionIndex(0);
            setLastAnswer(null);
            answerTracker.reset();
        }
    };

    const renderScreen = () => {
        switch(currentScreen) {
            case 'welcome':
                return <WelcomeScreen onStart={handleStart} />;
            case 'introduction':
                return <IntroductionScreen onContinue={handleIntroductionContinue} />;
            case 'moduleStructure':
                return <ModuleStructureScreen onContinue={handleModuleStructureContinue} />;
            case 'question':
                return (
                    <QuestionScreen
                        question={quizData.questions[currentQuestionIndex]}
                        onAnswer={handleAnswer}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={quizData.questions.length}
                    />
                );
            case 'outcome':
                return (
                    <OutcomeScreen
                        outcomeId={lastAnswer}
                        onContinue={handleOutcomeContinue}
                        questionNumber={currentQuestionIndex + 1}
                    />
                );
            case 'results':
                return (
                    <ResultsScreen
                        results={answerTracker.getResults()}
                        onRestart={handleRestart}
                        onExit={handleExit}
                    />
                );
            default:
                return <WelcomeScreen onStart={handleStart} />;
        }
    };

    return (
        <div className="main-container">
            <Header />
            {renderScreen()}
        </div>
    );
};

// Render the App
ReactDOM.render(<App />, document.getElementById('root'));
