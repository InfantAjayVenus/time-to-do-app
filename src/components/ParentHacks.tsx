import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const ParentHacks = () => {
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
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          Next Tip
          <ChevronRight size={16} />
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
  );
};

export default ParentHacks;
