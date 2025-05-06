import { useState, useEffect, useRef } from "react";
import { Clock, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface ReadingTimerProps {
  onStartTimer: (minutes: number) => void;
  soundUrl?: string;
}

const ReadingTimer = ({
  onStartTimer,
  soundUrl = "/notification.mp3",
}: ReadingTimerProps) => {
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [customTime, setCustomTime] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const presetTimes = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(soundUrl);

    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [soundUrl]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    // Set up interval for countdown
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer complete
          clearInterval(intervalRef.current!);
          handleTimerComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleTimerComplete = () => {
    setIsActive(false);
    setShowCompletion(true);
    onStartTimer(timerMinutes); // Save progress

    if (soundEnabled && audioRef.current) {
      audioRef.current.loop = true; 
      audioRef.current
        .play()
        .catch((err) => console.error("Error playing sound:", err));
    }
  };

  const startTimer = () => {
    setTimeLeft(timerMinutes * 60);
    setIsActive(true);
    setIsPaused(false);
    setShowCompletion(false);
    onStartTimer(timerMinutes);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(timerMinutes * 60);
    setShowCompletion(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTimerMinutes(Math.min(value, 120));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    if (!isActive) return 0;
    const totalSeconds = timerMinutes * 60;
    const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    return progressPercent;
  };

  // Convert remaining time into a visual representation (circle)
  const calculateCircleProgress = () => {
    const circumference = 2 * Math.PI * 120; // Circle radius = 120
    if (!isActive) return circumference;

    const progress = calculateProgress();
    return circumference - (progress / 100) * circumference;
  };

  // Show full-screen completion
  if (showCompletion) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-amber-900 z-50 p-6">
        <div className="text-center max-w-2xl">
          {/* Animated completion elements */}
          <div className="relative">
            {/* Starburst effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-ping absolute w-24 h-24 bg-amber-600 rounded-full opacity-20"></div>
              <div
                className="animate-ping absolute w-32 h-32 bg-amber-500 rounded-full opacity-10"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="animate-ping absolute w-40 h-40 bg-amber-400 rounded-full opacity-5"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>

            {/* Icon */}
            <div className="inline-block p-6 bg-green-600 rounded-full mb-8 relative z-10">
              <Clock size={64} className="text-white" />
            </div>
          </div>

          <h2 className="text-5xl font-bold text-amber-100 mb-6">Time&apos;s Up!</h2>
          <p className="text-2xl text-amber-200 mb-8">
            Your {timerMinutes} minute reading session is complete!
          </p>
          <div className="text-xl text-amber-300 mb-8">
            Congratulations on completing your reading session!
          </div>
          <button
            onClick={() => {
              setShowCompletion(false);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.loop = false; 
              }
            }}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-lg rounded-md font-medium transition-colors shadow-lg"
          >
            Return to Timer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-amber-800 rounded-full mb-4">
          <Clock size={32} className="text-amber-200" />
        </div>
        <h2 className="text-2xl font-semibold text-amber-100">Reading Timer</h2>
        <p className="text-amber-300 mt-2">
          Set a timer for your reading session (max 2 hours)
        </p>
      </div>

      {/* Sound toggle button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-amber-800 hover:bg-amber-700"
        >
          {soundEnabled ? (
            <Volume2 size={20} className="text-amber-200" />
          ) : (
            <VolumeX size={20} className="text-amber-200" />
          )}
        </button>
      </div>

      {/* Timer Setup - only shown when timer is not active */}
      {!isActive && (
        <>
          {!customTime ? (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {presetTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setTimerMinutes(time)}
                  className={`py-3 rounded-md text-center transition-colors ${
                    timerMinutes === time
                      ? "bg-amber-600 text-white font-medium"
                      : "bg-amber-800 text-amber-200 hover:bg-amber-700"
                  }`}
                >
                  {time} min
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-amber-200 mb-2">
                Custom time (minutes):
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={timerMinutes}
                onChange={handleCustomTimeChange}
                className="w-full bg-amber-800 text-amber-100 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div className="flex justify-center mb-6">
            <button
              onClick={() => setCustomTime(!customTime)}
              className="text-amber-300 underline hover:text-amber-200 transition-colors"
            >
              {customTime ? "Use preset times" : "Set custom time"}
            </button>
          </div>

          <div className="flex justify-center items-center mb-6">
            <div className="bg-amber-800 rounded-lg p-4 w-40 text-center">
              <p className="text-4xl font-bold text-amber-100">
                {timerMinutes}
              </p>
              <p className="text-amber-300 text-sm">minutes</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={startTimer}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium transition-colors shadow-md"
            >
              Start Reading Session
            </button>
          </div>
        </>
      )}

      {/* Active Timer Display - only shown when timer is active */}
      {isActive && (
        <div className="mt-4">
          {/* Progress bar */}
          <div className="h-4 bg-amber-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>

          {/* Visual circular timer */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-64 h-64">
              {/* Background circle */}
              <svg className="w-full h-full" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#78350f"
                  strokeWidth="12"
                />

                {/* Progress circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={calculateCircleProgress()}
                  strokeLinecap="round"
                  transform="rotate(-90, 128, 128)"
                  className="transition-all duration-1000"
                />

                {/* Center display */}
                <foreignObject x="28" y="28" width="200" height="200">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-amber-900 rounded-full">
                    <p className="text-6xl font-bold text-amber-100">
                      {formatTime(timeLeft)}
                    </p>
                    <p className="text-amber-300 text-lg mt-2">remaining</p>

                    {/* Small icon to indicate timer status */}
                    <div className="mt-3">
                      {isPaused ? (
                        <div className="text-amber-400">PAUSED</div>
                      ) : (
                        <div className="flex space-x-1">
                          <span className="animate-pulse w-2 h-2 bg-amber-400 rounded-full"></span>
                          <span
                            className="animate-pulse w-2 h-2 bg-amber-400 rounded-full"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                          <span
                            className="animate-pulse w-2 h-2 bg-amber-400 rounded-full"
                            style={{ animationDelay: "0.4s" }}
                          ></span>
                        </div>
                      )}
                    </div>
                  </div>
                </foreignObject>
              </svg>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex justify-center space-x-4">
            {isPaused ? (
              <button
                onClick={resumeTimer}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors shadow-md"
              >
                <Play size={20} className="mr-2" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium transition-colors shadow-md"
              >
                <Pause size={20} className="mr-2" />
                Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-medium transition-colors shadow-md"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-amber-400 text-sm">
          Your progress will be automatically saved when the timer ends or if
          you stop early.
        </p>
      </div>
    </div>
  );
};

export default ReadingTimer;
