import { useState, useRef, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import InputText from '../../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import PageBanner from "../../../components/PageBanner/PageBanner";
import img1 from "../../../assets/images/about/about-1.jpg";
import img2 from "../../../assets/images/about/about-2.jpg";
import img3 from "../../../assets/images/about/about-3.jpg";

import Membership from "../../../Pages/SitePages/About/Membership"
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome is imported


import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { BsCheckCircle, BsXCircle, BsFullscreen } from 'react-icons/bs';
import ReactPlayer from "react-player";
const quizQuestions = [
  {
    "question": "Ano ang pangunahing hakbang sa paghahanda ng mga materyales tulad ng lamon at rattan bago gamitin sa paggawa ng handicrafts?",
    "options": [
      "I-babad ang rattan",
      "Putulin ang rattan",
      "Habiin ang rattan",
      "Patuyuin ang rattan"
    ],
    "answer": "I-babad ang rattan"
  },
  {
    "question": "Anong uri ng mga produkto ang maaaring malikha gamit ang lamon at rattan, at paano ito makatutulong sa pang-araw-araw na buhay?",
    "options": [
      "Basket at lalagyan",
      "Muwebles",
      "Bag at wallet",
      "Dekorasyon at puno ng palamuti"
    ],
    "answer": "Basket at lalagyan"
  },
  {
    "question": "Bakit mahalaga ang paggamit ng lamon at rattan sa paggawa ng handicrafts sa aspeto ng kalikasan at kultura?",
    "options": [
      "Nagpapalaganap ng mga eco-friendly na produkto",
      "Nagbibigay ng mataas na presyo sa mga produkto",
      "Nagpapabilis ng paggawa ng mga gamit",
      "Nagpapataas ng produksyon ng mga pabrika"
    ],
    "answer": "Nagpapalaganap ng mga eco-friendly na produkto"
  }

];

const Quiz = ({
  setMyScore,
  setActiveTab,
  activeTab,
  setQuizItem
}) => {

  console.log({ setMyScore })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [highlightedAnswers, setHighlightedAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnswerSelection = (answer) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(updatedAnswers);

    // Highlight answer immediately
    const newHighlightedAnswers = [...highlightedAnswers];
    newHighlightedAnswers[currentQuestionIndex] = answer === quizQuestions[currentQuestionIndex].answer ? 'correct' : 'incorrect';
    setHighlightedAnswers(newHighlightedAnswers);

    // Clear error message once the answer is selected
    setErrorMessage('');
  };

  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestionIndex] === null) {
      setErrorMessage('Please select an answer before proceeding.');
      return;
    }

    // Check if the answer is correct
    if (selectedAnswers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].answer) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setScore(prevScore => prevScore + 1);
      setMyScore(score);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      //setCurrentQuestionIndex(currentQuestionIndex + 1);
    }

    // Move to the next question or show the score summary

  };

  const calculateScore = () => {
    const totalScore = selectedAnswers.filter(
      (answer, index) => answer === quizQuestions[index].answer
    ).length;
    setScore(totalScore);
  };

  const renderQuiz = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    return (
      <div className="quiz-container max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">{currentQuestion.question}</h2>

        {/* Display Question Number */}
        <div className="text-sm text-gray-500 mb-4">
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </div>

        <div className="options mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === option;
            const highlight = highlightedAnswers[currentQuestionIndex];

            return (
              <div
                key={index}
                className={`w-full text-left px-4 py-2 mb-2 rounded-lg border-2 ${isSelected
                  ? highlight === 'correct'
                    ? 'border-green-500 bg-green-100'
                    : highlight === 'incorrect'
                      ? 'border-red-500 bg-red-100'
                      : 'border-gray-300'
                  : 'border-gray-300'
                  }`}
                onClick={() => handleAnswerSelection(option)}
              >
                <span>{option}</span>
                {isSelected && (
                  <span className="ml-2">
                    {highlight === 'correct' ? (
                      <BsCheckCircle className="text-green-500" />
                    ) : highlight === 'incorrect' ? (
                      <BsXCircle className="text-red-500" />
                    ) : null}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <div className="flex justify-between">
          <button
            className="py-2 px-4 rounded-lg bg-blue-500 text-white"
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? 'See Your Score' : 'Next Question'}
          </button>
        </div>
      </div>
    );
  };

  // if(currentQuestionIndex === quizQuestions.length){
  //   setActiveTab()
  // }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {currentQuestionIndex !== quizQuestions.length ? renderQuiz() : (
        <div className="result-container max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-semibold mb-4">Your Score</h2>
          <p className="text-5xl font-bold text-blue-500">{score} / {quizQuestions.length}</p>
          <p className="mt-4 text-lg">Well done! You finished the quiz on making rattan baskets.</p>
          <button
            className="mt-4 py-2 px-4 rounded-lg bg-green-500 text-white"
            onClick={() => {
              setActiveTab(activeTab + 1)
              setQuizItem(quizQuestions.length + 1)
            }} // Restart the quiz
          >
            Go to Membership Form
          </button>
        </div>
      )}
    </div>
  );
};
const VideoPlayer = ({ videoId, videoSrc, onComplete }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnd = () => {
    onComplete(); // Trigger callback when the video ends
    setIsPlaying(false); // Reset play state
    setProgress(100); // Set progress to 100%
  };
  const handleSliderChange = (e) => {
    const newTime = (e.target.value / 100) * videoRef.current.duration;

    // Allow rewinding but prevent skipping beyond the highest watched time
    if (newTime <= maxWatchedTime) {
      videoRef.current.currentTime = newTime;
      setProgress((newTime / videoRef.current.duration) * 100);
    } else {
      alert('You can only rewind to a previously watched point.');
    }
  };


  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        setProgress((currentTime / videoRef.current.duration) * 100);

        // Update the max watched time if the current time exceeds it
        if (currentTime > maxWatchedTime) {
          setMaxWatchedTime(currentTime);
        }
      }
    };

    const video = videoRef.current;
    video?.addEventListener("timeupdate", updateProgress);
    video?.addEventListener("ended", handleEnd); // Add listener for video end

    return () => {
      video?.removeEventListener("timeupdate", updateProgress);
      video?.removeEventListener("ended", handleEnd); // Cleanup
    };
  }, [handleEnd, maxWatchedTime]);
  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };


  return (
    <div className="video-player relative">
      <h2 className="text-xl font-semibold mb-2">{videoId}</h2>
      <div className="relative">
        <video
          ref={videoRef}
          src={videoSrc}
          onTimeUpdate={handleTimeUpdate}
          className="w-full aspect-video rounded-lg border-2 border-gray-300"
          onClick={handlePlayPause}
        />
        <button
          onClick={handleFullScreen}
          className="absolute bottom-3 right-3 text-white
          "
        >
          <BsFullscreen size={30} />
        </button>
      </div>
      <div className="flex justify-between mt-2 items-center">
        <button
          onClick={handlePlayPause}
          className="py-2 px-4 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSliderChange}
          className="w-full mx-4"
          aria-label="Video progress"
        />
      </div>
    </div>
  );
};



const About = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);

  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required field'),
      password: Yup.string()
        .min(8, 'Minimun of 8 character(s)')
        .required('Required field')
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {

    }
  };

  const [activeTab, setActiveTab] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState([false, false, false, false])
  const [myScore, setMyScore] = useState(0);
  const [quizItem, setQuizItem] = useState(0);


  const handleVideoComplete = (index) => {

    console.log({ index })
    const updatedCompleted = [...videoCompleted];
    updatedCompleted[index] = true;
    setVideoCompleted(updatedCompleted);
    if (index < videoCompleted.length - 1) {
      setActiveTab(index + 1); // Move to next tab if the current one is completed
    }
  };

  const [activeMembership, setActiveMembership] = useState([]);

  const listActiveMembership = async () => {
    let res = await axios({
      method: 'POST',
      url: `users/getMembership`,
      data: {
        email: user.email
      }
    }).then(async (res) => {
      let data = res.data.data;



      setActiveMembership(data)

    });




  };
  useEffect(() => {
    listActiveMembership();
  }, []);



  let memId = activeMembership?._id
  return (
    <section>
      {/* <PageBanner pathname={pathname} /> */}
      <div className="container mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-center"></h1>
        <div className="flex space-x-4 mb-4">
          {['Tutorial 1', 'Tutorial 2', 'Q & A', 'Membership'].map((video, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-4 rounded-md text-white transition duration-200 ${memId || index <= activeTab ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
                }`}
              disabled={!memId && index > activeTab}
            >

              {video}
              {videoCompleted[index] && <i className="ml-4 fas fa-check text-green"></i>} {/* Check icon */}
            </button>
          ))}
        </div>

        <div className="video-container mb-6 p-4 bg-white rounded-lg shadow">
          {activeTab === 0 && (
            <VideoPlayer
              videoId="How to make fruit basket"

              videoSrc="https://firebasestorage.googleapis.com/v0/b/ratan-eccomerce.appspot.com/o/FRUIT_BASKET.mp4?alt=media&token=ab71cb92-3f7f-4f58-949c-489711c2cf5f" // URL for Video 1
              onComplete={() => handleVideoComplete(0)}
            />
          )}
          {activeTab === 1 && (
            <VideoPlayer
              videoId="Weaving of rattan"
              videoSrc="https://firebasestorage.googleapis.com/v0/b/ratan-eccomerce.appspot.com/o/FRUIT_BASKET.mp4?alt=media&token=ab71cb92-3f7f-4f58-949c-489711c2cf5f" // URL for Video 2
              onComplete={() => handleVideoComplete(1)}
            />
          )}
          {activeTab === 2 && (
            <div>
              <Quiz
                setActiveTab={setActiveTab}
                setMyScore={setMyScore}
                activeTab={activeTab}
                setQuizItem={setQuizItem}

              />
            </div>
          )}
          {activeTab === 3 && (
            <Membership
              myScore={myScore}
              quizItemTotal={quizQuestions.length}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
