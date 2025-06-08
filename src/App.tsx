import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Clock, CheckCircle, Heart, Calendar as CalendarIcon, Target, Brain, Coffee } from 'lucide-react'
import './App.css'

// Import components
import Calendar from './components/Calendar'
import DailyTasks from './components/DailyTasks'
import FocusTimer from './components/FocusTimer'
import ParentHacks from './components/ParentHacks'

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

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: 'work' | 'kid' | 'family' | 'personal' | 'appointment';
  addToTasks?: boolean;
}

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [completedToday, setCompletedToday] = useState(0);
  const [focusTimer, setFocusTimer] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [workSession, setWorkSession] = useState<{
    tasks: Task[];
    currentIndex: number;
    isActive: boolean;
  }>({ tasks: [], currentIndex: 0, isActive: false });

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer(timer => timer - 1);
      }, 1000);
    } else if (focusTimer === 0) {
      setIsTimerRunning(false);
      
      // Complete a pomodoro for current task
      if (currentTaskId) {
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === currentTaskId) {
            const newCompletedPomodoros = task.completedPomodoros + 1;
            const isTaskComplete = newCompletedPomodoros >= task.pomodoros;
            
            if (isTaskComplete && !task.completed) {
              setCompletedToday(prev => prev + 1);
            }
            
            return {
              ...task,
              completedPomodoros: newCompletedPomodoros,
              completed: isTaskComplete
            };
          }
          return task;
        }));
      }
      
      // Handle work session progression
      if (workSession.isActive) {
        const currentTask = workSession.tasks[workSession.currentIndex];
        if (currentTask && currentTask.completedPomodoros + 1 >= currentTask.pomodoros) {
          // Move to next task in session
          const nextIndex = workSession.currentIndex + 1;
          if (nextIndex < workSession.tasks.length) {
            setWorkSession(prev => ({ ...prev, currentIndex: nextIndex }));
            setCurrentTaskId(workSession.tasks[nextIndex].id);
            alert(`Pomodoro complete! 🎉 Moving to next task: ${workSession.tasks[nextIndex].text}`);
          } else {
            setWorkSession({ tasks: [], currentIndex: 0, isActive: false });
            setCurrentTaskId(null);
            alert('Work session complete! 🎉 Great job!');
          }
        } else {
          alert(`Pomodoro complete! 🎉 Take a ${workSession.currentIndex % 4 === 3 ? '15-30 minute' : '5 minute'} break, then continue with: ${currentTask?.text}`);
        }
      } else {
        alert('Focus session complete! Time for a break 🎉');
      }
      
      setFocusTimer(25 * 60);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, focusTimer, currentTaskId, workSession]);

  // Auto-sync today's work events to tasks when component loads
  useEffect(() => {
    const formatDateKey = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const today = formatDateKey(new Date());
    const todayEvents = calendarEvents[today] || [];
    const workEventsToSync = todayEvents.filter(event => 
      event.addToTasks && 
      event.type === 'work' && 
      !tasks.some(task => task.calendarEventId === event.id)
    );

    if (workEventsToSync.length > 0) {
      const newTasks = workEventsToSync.map(event => ({
        id: Date.now() + Math.random(),
        text: event.time ? `${event.title} (${event.time})` : event.title,
        completed: false,
        priority: 'medium',
        timeEstimate: '30min',
        fromCalendar: true,
        calendarEventId: event.id,
        pomodoros: 1,
        completedPomodoros: 0
      }));
      
      setTasks(prev => [...prev, ...newTasks]);
    }
  }, [calendarEvents, tasks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Heart className="text-red-500" />
          Parent + Remote Worker Hub
        </h1>
        <p className="text-gray-600">Managing chaos like a pro, one task at a time ✨</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-green-700">{completedToday}</div>
            <div className="text-green-600">Tasks Done Today</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <Clock className="text-blue-600 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-blue-700">{formatTime(focusTimer)}</div>
            <div className="text-blue-600">Focus Timer</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <Target className="text-purple-600 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-purple-700">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-purple-600">Tasks Remaining</div>
          </div>
        </div>
      </div>

      <Navigation />
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <Routes>
          <Route path="/" element={
            <DailyTasks 
              tasks={tasks} 
              setTasks={setTasks} 
              completedToday={completedToday} 
              setCompletedToday={setCompletedToday}
              currentTaskId={currentTaskId}
              setCurrentTaskId={setCurrentTaskId}
              workSession={workSession}
              setWorkSession={setWorkSession}
              focusTimer={focusTimer}
              setFocusTimer={setFocusTimer}
              isTimerRunning={isTimerRunning}
              setIsTimerRunning={setIsTimerRunning}
            />
          } />
          <Route path="/calendar" element={
            <Calendar 
              calendarEvents={calendarEvents} 
              setCalendarEvents={setCalendarEvents} 
              tasks={tasks} 
              setTasks={setTasks} 
            />
          } />
          <Route path="/focus" element={
            <FocusTimer 
              focusTimer={focusTimer} 
              setFocusTimer={setFocusTimer} 
              isTimerRunning={isTimerRunning} 
              setIsTimerRunning={setIsTimerRunning}
              tasks={tasks}
              currentTaskId={currentTaskId}
              setCurrentTaskId={setCurrentTaskId}
              workSession={workSession}
              setWorkSession={setWorkSession}
            />
          } />
          <Route path="/tips" element={<ParentHacks />} />
        </Routes>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-wrap gap-2">
        <Link 
          to="/calendar"
          className={`px-4 py-2 rounded-lg font-medium ${isActive('/calendar') ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <CalendarIcon className="inline mr-2" size={16} />
          Weekly Calendar
        </Link>
        <Link 
          to="/"
          className={`px-4 py-2 rounded-lg font-medium ${isActive('/') && location.pathname === '/' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <CheckCircle className="inline mr-2" size={16} />
          Daily Tasks
        </Link>
        <Link 
          to="/focus"
          className={`px-4 py-2 rounded-lg font-medium ${isActive('/focus') ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <Brain className="inline mr-2" size={16} />
          Focus Timer
        </Link>
        <Link 
          to="/tips"
          className={`px-4 py-2 rounded-lg font-medium ${isActive('/tips') ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <Coffee className="inline mr-2" size={16} />
          Parent Hacks
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Dashboard />
    </Router>
  )
}

export default App
