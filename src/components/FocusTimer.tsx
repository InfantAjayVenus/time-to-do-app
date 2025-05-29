import { Play, Pause, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  focusTimer: number;
  setFocusTimer: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

const FocusTimer = ({ focusTimer, setFocusTimer, isTimerRunning, setIsTimerRunning }: FocusTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setFocusTimer(25 * 60);
    setIsTimerRunning(false);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pomodoro Focus Timer</h2>
      <p className="text-gray-600 mb-6">Perfect for working in short bursts between parenting moments</p>
      
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-xl mb-6">
        <div className="text-6xl font-bold text-gray-800 mb-4">
          {formatTime(focusTimer)}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              isTimerRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                Start
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">25 Min Focus</h3>
          <p>Deep work when kid is occupied</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">5 Min Break</h3>
          <p>Check on kiddo, stretch, snack</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">15 Min Break</h3>
          <p>After 4 cycles - longer parent time</p>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
