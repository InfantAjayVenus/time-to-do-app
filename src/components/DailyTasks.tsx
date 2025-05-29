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
}

interface DailyTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  completedToday: number;
  setCompletedToday: React.Dispatch<React.SetStateAction<number>>;
}

const DailyTasks = ({ tasks, setTasks, setCompletedToday }: DailyTasksProps) => {
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: newTask, 
        completed: false, 
        priority: 'medium',
        timeEstimate: '30min'
      }]);
      setNewTask('');
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Game Plan</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task (be specific and realistic!)"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          Add
        </button>
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
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} ${task.fromCalendar ? 'flex items-center gap-2' : ''}`}>
                {task.text}
                {task.fromCalendar && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">📅 From calendar</span>}
              </span>
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
