import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  type: 'work' | 'kid' | 'family' | 'personal' | 'appointment';
  addToTasks?: boolean;
}

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

interface CalendarProps {
  calendarEvents: Record<string, CalendarEvent[]>;
  setCalendarEvents: React.Dispatch<React.SetStateAction<Record<string, CalendarEvent[]>>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Calendar = ({ calendarEvents, setCalendarEvents, setTasks }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState<{ title: string; time: string; type: string; addToTasks: boolean }>({ 
    title: '', 
    time: '', 
    type: 'work', 
    addToTasks: true 
  });

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
          id: Date.now() + 1,
          text: taskText,
          completed: false,
          priority: 'medium',
          timeEstimate: '30min',
          fromCalendar: true,
          calendarEventId: eventId,
          pomodoros: 1,
          completedPomodoros: 0
        }]);
      }
      
      setNewEvent({ title: '', time: '', type: 'work', addToTasks: true });
    }
  };

  const deleteEvent = (dateKey: string, eventId: number) => {
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

  const getEventTypeEmoji = (type: string) => {
    switch (type) {
      case 'work': return '💼';
      case 'kid': return '👶';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'personal': return '🧘';
      case 'appointment': return '🏥';
      default: return '📅';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Planning Calendar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Grid */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            >
              <ChevronRight size={16} />
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
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
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
                    <span>{getEventTypeEmoji(event.type)}</span>
                    <span>{event.title}</span>
                  </div>
                  {event.time && (
                    <div className="text-xs text-gray-500 mt-1">⏰ {event.time}</div>
                  )}
                </div>
                <button
                  onClick={() => deleteEvent(formatDateKey(selectedDate), event.id)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  <Trash2 size={16} />
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
  );
};

export default Calendar;
