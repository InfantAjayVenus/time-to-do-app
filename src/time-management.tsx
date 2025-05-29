import  { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, Target, Brain, Coffee, Heart } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string;
  timeEstimate: string;
  fromCalendar?: boolean;
  calendarEventId?: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: 'work' | 'kid' | 'family' | 'personal' | 'appointment';
  addToTasks?: boolean;
}

interface Reminder extends CalendarEvent {
  timeUntil: number;
}

const TimeManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('planner');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [focusTimer, setFocusTimer] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [newEvent, setNewEvent] = useState<{ title: string; time: string; type: string; addToTasks: boolean }>({ title: '', time: '', type: 'work', addToTasks: true });
  
  // Reminder state
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [reminderPermission, setReminderPermission] = useState<NotificationPermission>('default');

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && focusTimer > 0) {
      interval = setInterval(() => {
        setFocusTimer(timer => timer - 1);
      }, 1000);
    } else if (focusTimer === 0) {
      setIsTimerRunning(false);
      alert('Focus session complete! Time for a break 🎉');
      setFocusTimer(25 * 60);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, focusTimer]);

  // Check for upcoming reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayKey = formatDateKey(now);
      const todayEvents = calendarEvents[todayKey] || [];
      
      const upcoming = todayEvents.filter(event => {
        if (!event.time) return false;
        
        const [hours, minutes] = event.time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        
        // Show reminder 10 minutes before
        const reminderTime = new Date(eventTime.getTime() - 10 * 60 * 1000);
        
        return now >= reminderTime && now < eventTime;
      }).map(event => ({
        ...event,
        timeUntil: Math.ceil((new Date().setHours(Number(event.time.split(':')[0]), Number(event.time.split(':')[1]), 0, 0) - now.getTime()) / (1000 * 60))
      }));
      
      setUpcomingReminders(upcoming);
      
      // Show browser notification for work events
      if (upcoming.length > 0 && reminderPermission === 'granted') {
        upcoming.forEach(event => {
          if (event.type === 'work' && event.timeUntil <= 10 && event.timeUntil > 0) {
            new Notification(`Upcoming: ${event.title}`, {
              body: `Starting in ${event.timeUntil} minutes`,
              icon: '⏰'
            });
          }
        });
      }
    };
    
    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately
    
    return () => clearInterval(interval);
  }, [calendarEvents, reminderPermission]);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setReminderPermission(permission);
        });
      } else {
        setReminderPermission(Notification.permission);
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Calendar functions
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const addEvent = () => {
    if (newEvent.title.trim()) {
      const dateKey = formatDateKey(selectedDate);
      const eventId = Date.now();
      const event: CalendarEvent = {
        id: eventId,
        title: newEvent.title,
        time: newEvent.time,
        type: newEvent.type as CalendarEvent['type'],
        addToTasks: newEvent.addToTasks || false
      };
      
      setCalendarEvents({
        ...calendarEvents,
        [dateKey]: [
          ...(calendarEvents[dateKey] || []),
          event
        ]
      });

      // Auto-add to today's tasks if it's for today and marked to add to tasks
      const today = formatDateKey(new Date());
      if (dateKey === today && event.addToTasks && event.type === 'work') {
        const taskText = event.time ? `${event.title} (${event.time})` : event.title;
        setTasks(prev => [...prev, {
          id: Date.now() + 1, // Slightly different ID to avoid conflicts
          text: taskText,
          completed: false,
          priority: 'medium',
          timeEstimate: '30min',
          fromCalendar: true,
          calendarEventId: eventId
        }]);
      }
      
      setNewEvent({ title: '', time: '', type: 'work', addToTasks: true });
    }
  };

  // Auto-sync today's work events to tasks when component loads
  useEffect(() => {
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
        calendarEventId: event.id
      }));
      
      setTasks(prev => [...prev, ...newTasks]);
    }
  }, [calendarEvents, tasks]);

  const deleteEvent = (dateKey: string, eventId: number) => {
    // Also remove from tasks if it was synced
    setTasks(prev => prev.filter(task => task.calendarEventId !== eventId));
    
    setCalendarEvents({
      ...calendarEvents,
      [dateKey]: calendarEvents[dateKey].filter(event => event.id !== eventId)
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const parentingTips = [
    "📱 Put phone in another room during focused work blocks",
    "🎵 Use noise-canceling headphones as your 'do not disturb' signal",
    "⏰ Work in 15-25 minute sprints when kiddo is occupied",
    "🧸 Set up activity bins for independent play during calls",
    "☕ Prep everything the night before (coffee, snacks, materials)",
    "🤝 Trade childcare hours with other parent friends",
    "📺 Strategic screen time during your most important tasks",
    "🍎 Batch similar tasks (all calls, all emails, all creative work)"
  ];

  const [currentTip, setCurrentTip] = useState(0);

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
        
        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <h3 className="font-semibold text-yellow-800">⏰ Upcoming Events</h3>
            </div>
            <div className="space-y-2">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700">
                    <strong>{reminder.title}</strong> at {reminder.time}
                  </span>
                  <span className="text-yellow-600 font-medium">
                    {reminder.timeUntil > 0 ? `in ${reminder.timeUntil}min` : 'starting now!'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Calendar className="inline mr-2" size={16} />
            Weekly Calendar
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'planner' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <CheckCircle className="inline mr-2" size={16} />
            Daily Tasks
          </button>
          <button 
            onClick={() => setActiveTab('focus')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'focus' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Brain className="inline mr-2" size={16} />
            Focus Timer
          </button>
          <button 
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'tips' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Coffee className="inline mr-2" size={16} />
            Parent Hacks
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Planning Calendar</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Grid */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    ←
                  </button>
                  <h3 className="text-lg font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-12"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dateKey = formatDateKey(date);
                    const hasEvents = calendarEvents[dateKey] && calendarEvents[dateKey].length > 0;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`h-12 p-1 text-sm rounded hover:bg-blue-100 relative ${
                          isToday(date) ? 'bg-blue-500 text-white font-bold' :
                          isSameDate(date, selectedDate) ? 'bg-blue-200 font-semibold' :
                          'bg-white border border-gray-200'
                        }`}
                      >
                        {day}
                        {hasEvents && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {/* Add Event Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Add event/appointment..."
                    className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                  />
                  <div className="flex gap-2 mb-2">
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="work">💼 Work</option>
                      <option value="kid">👶 Kid Activity</option>
                      <option value="family">👨‍👩‍👧‍👦 Family</option>
                      <option value="personal">🧘 Personal</option>
                      <option value="appointment">🏥 Appointment</option>
                    </select>
                  </div>
                  
                  {newEvent.type === 'work' && (
                    <div className="mb-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={newEvent.addToTasks}
                          onChange={(e) => setNewEvent({...newEvent, addToTasks: e.target.checked})}
                          className="rounded"
                        />
                        📋 Auto-add to daily tasks (for today's work items)
                      </label>
                    </div>
                  )}
                  
                  <button
                    onClick={addEvent}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Add Event
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(calendarEvents[formatDateKey(selectedDate)] || []).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {event.title}
                          {event.addToTasks && event.type === 'work' && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">📋 Synced to tasks</span>
                          )}
                        </div>
                        {event.time && (
                          <div className="text-xs text-gray-500">{event.time}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEvent(formatDateKey(selectedDate), event.id)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!calendarEvents[formatDateKey(selectedDate)] || calendarEvents[formatDateKey(selectedDate)].length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No events scheduled for this day
                    </div>
                  )}
                </div>

                {/* Quick Planning Tips */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-2">⚡ Planning & Reminder Tips:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Get 10-minute reminders for all timed events automatically</li>
                    <li>• Browser notifications work best when this tab stays open</li>
                    <li>• Schedule kid activities during your low-energy work times</li>
                    <li>• Buffer 15 mins between meetings for toddler interruptions</li>
                    <li>• Plan one "focus day" per week when possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
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
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
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
                  className={`px-6 py-3 rounded-lg font-medium ${isTimerRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setFocusTimer(25 * 60);
                    setIsTimerRunning(false);
                  }}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
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
        )}

        {activeTab === 'tips' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Survival Hacks for Parent Workers</h2>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl mb-6">
              <div className="text-lg font-medium text-gray-800 mb-4">
                💡 Today's Hack:
              </div>
              <div className="text-xl text-gray-700 mb-4">
                {parentingTips[currentTip]}
              </div>
              <button
                onClick={() => setCurrentTip((currentTip + 1) % parentingTips.length)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Next Tip
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-3">⚡ Beat Procrastination</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Use the "2-minute rule" - if it takes less than 2 min, do it now</li>
                  <li>• Start with the tiniest possible step</li>
                  <li>• Set implementation intentions: "When X happens, I will do Y"</li>
                  <li>• Reward yourself after completing difficult tasks</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">🎯 Stop Overcommitting</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Practice saying "Let me check my calendar and get back to you"</li>
                  <li>• Build in 25% buffer time for everything</li>
                  <li>• Set 3 max priorities per day (not 10)</li>
                  <li>• Remember: saying no to one thing means saying yes to your family</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-3">📵 Minimize Distractions</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>• Phone in another room during focused work</li>
                  <li>• Use website blockers during deep work sessions</li>
                  <li>• Batch all communications to specific times</li>
                  <li>• Create a "shutdown ritual" to end your workday</li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-bold text-red-800 mb-3">📅 Smart Planning</h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Plan your week Sunday evening (15 mins max)</li>
                  <li>• Time-block your calendar including parent duties</li>
                  <li>• Prep tomorrow tonight (clothes, coffee, materials)</li>
                  <li>• Have 2-3 backup plans for when kiddo needs attention</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeManagementDashboard;