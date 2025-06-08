import { Play, Pause, RotateCcw, Square } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string;
  timeEstimate: string;
  fromCalendar?: boolean;
  calendarEventId?: number;
  pomodoros: number;
  completedPomodoros: number;
}

interface FocusTimerProps {
  focusTimer: number;
  setFocusTimer: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  currentTaskId: number | null;
  setCurrentTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  workSession: {
    tasks: Task[];
    currentIndex: number;
    isActive: boolean;
  };
  setWorkSession: React.Dispatch<React.SetStateAction<{
    tasks: Task[];
    currentIndex: number;
    isActive: boolean;
  }>>;
}

const FocusTimer = ({ 
  focusTimer, 
  setFocusTimer, 
  isTimerRunning, 
  setIsTimerRunning,
  tasks,
  currentTaskId,
  setCurrentTaskId,
  workSession,
  setWorkSession
}: FocusTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setFocusTimer(25 * 60);
    setIsTimerRunning(false);
  };

  const stopSession = () => {
    setCurrentTaskId(null);
    setWorkSession({ tasks: [], currentIndex: 0, isActive: false });
    setIsTimerRunning(false);
    setFocusTimer(25 * 60);
  };

  const getTotalPomodoros = (taskList: Task[]) => {
    return taskList.reduce((total, task) => total + task.pomodoros, 0);
  };

  const getCompletedPomodoros = (taskList: Task[]) => {
    return taskList.reduce((total, task) => total + task.completedPomodoros, 0);
  };

  const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) : null;

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pomodoro Focus Timer</h2>
      <p className="text-gray-600 mb-6">Perfect for working in short bursts between parenting moments</p>
      
      {/* Current Task Display */}
      {currentTask && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-left">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Currently Working On:</h3>
              <p className="text-lg">{currentTask.text}</p>
              <p className="text-sm text-gray-600">
                🍅 {currentTask.completedPomodoros}/{currentTask.pomodoros} pomodoros 
                ({Math.round((currentTask.completedPomodoros / currentTask.pomodoros) * 100)}% complete)
              </p>
            </div>
            <button
              onClick={stopSession}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Square size={16} />
              Stop Session
            </button>
          </div>
        </div>
      )}

      {/* Work Session Progress */}
      {workSession.isActive && workSession.tasks.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">Work Session Progress</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Task {workSession.currentIndex + 1} of {workSession.tasks.length}
            </p>
            <p className="text-sm text-gray-600">
              Total: 🍅 {getCompletedPomodoros(workSession.tasks)}/{getTotalPomodoros(workSession.tasks)} pomodoros
            </p>
            <div className="bg-white rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(getCompletedPomodoros(workSession.tasks) / getTotalPomodoros(workSession.tasks)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
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
          {(currentTask || workSession.isActive) && (
            <button
              onClick={stopSession}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Square size={20} />
              Stop Session
            </button>
          )}
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
