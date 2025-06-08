import { useState } from 'react';
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

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

interface DailyTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  completedToday: number;
  setCompletedToday: React.Dispatch<React.SetStateAction<number>>;
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
  focusTimer: number;
  setFocusTimer: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

const DailyTasks = ({ 
  tasks, 
  setTasks, 
  setCompletedToday, 
  currentTaskId, 
  setCurrentTaskId, 
  setWorkSession, 
  isTimerRunning,
  setIsTimerRunning 
}: DailyTasksProps) => {
  const [newTask, setNewTask] = useState('');
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask, 
        completed: false, 
        priority: 'medium',
        timeEstimate: '30min',
        pomodoros: newTaskPomodoros,
        completedPomodoros: 0
      }]);
      setNewTask('');
      setNewTaskPomodoros(1);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updated = { ...task, completed: !task.completed };
        if (updated.completed && !task.completed) {
          setCompletedToday(prev => prev + 1);
        } else if (!updated.completed && task.completed) {
          setCompletedToday(prev => Math.max(0, prev - 1));
        }
        return updated;
      }
      return task;
    }));
  };

  const deleteTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && task.completed) {
      setCompletedToday(prev => Math.max(0, prev - 1));
    }
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Work session functions
  const startWorkSession = (sessionTasks: Task[]) => {
    const incompleteTasks = sessionTasks.filter(task => !task.completed);
    if (incompleteTasks.length === 0) {
      alert('All selected tasks are already completed!');
      return;
    }
    
    setWorkSession({
      tasks: incompleteTasks,
      currentIndex: 0,
      isActive: true
    });
    setCurrentTaskId(incompleteTasks[0].id);
    setIsTimerRunning(true);
  };

  const startIndividualTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setWorkSession({ tasks: [], currentIndex: 0, isActive: false });
    setIsTimerRunning(true);
  };

  const getTotalPomodoros = (taskList: Task[]) => {
    return taskList.reduce((total, task) => total + task.pomodoros, 0);
  };


  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Game Plan</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a task (be specific and realistic!)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <select
              value={newTaskPomodoros}
              onChange={(e) => setNewTaskPomodoros(Number(e.target.value))}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 🍅</option>
              <option value={2}>2 🍅</option>
              <option value={3}>3 🍅</option>
              <option value={4}>4 🍅</option>
              <option value={5}>5 🍅</option>
            </select>
            <button
              onClick={addTask}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Work Session Planner */}
        {tasks.filter(t => !t.completed).length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              🎯 Work Session Planner
            </h3>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-purple-700">
                Total: {getTotalPomodoros(tasks.filter(t => !t.completed))} pomodoros 
                ({Math.round(getTotalPomodoros(tasks.filter(t => !t.completed)) * 25 / 60 * 10) / 10} hours)
              </div>
              <button
                onClick={() => startWorkSession(tasks.filter(t => !t.completed))}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
              >
                🚀 Start Session
              </button>
            </div>
            <div className="text-xs text-purple-600">
              💡 This will run through all incomplete tasks with automatic breaks between pomodoros
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="mx-auto mb-2" size={48} />
            <p>No tasks yet! Add your first one above.</p>
            <p className="text-sm mt-2">💡 Tip: Break big tasks into 15-30 minute chunks</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}
              >
                {task.completed && <CheckCircle size={16} />}
              </button>
              <div className="flex-1">
                <div className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} ${task.fromCalendar ? 'flex items-center gap-2' : ''}`}>
                  {task.text}
                  {task.fromCalendar && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">📅 From calendar</span>}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-sm text-gray-500">
                    🍅 {task.completedPomodoros}/{task.pomodoros} pomodoros
                    {task.completedPomodoros > 0 && (
                      <span className="ml-2 text-green-600">
                        ({Math.round(task.completedPomodoros / task.pomodoros * 100)}% complete)
                      </span>
                    )}
                  </div>
                  {!task.completed && (
                    <button
                      onClick={() => startIndividualTask(task.id)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      disabled={isTimerRunning}
                    >
                      {currentTaskId === task.id && isTimerRunning ? '⏱️ Active' : '▶️ Start'}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyTasks;
