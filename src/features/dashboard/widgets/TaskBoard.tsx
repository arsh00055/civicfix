import React from 'react';

const TaskBoard: React.FC = () => {
  const tasks = {
    todo: [
      { id: 1, title: 'Community Garden Setup', priority: 'high' },
      { id: 2, title: 'Park Bench Repair', priority: 'medium' },
    ],
    inProgress: [
      { id: 3, title: 'Street Light Maintenance', priority: 'high' },
    ],
    completed: [
      { id: 4, title: 'Playground Inspection', priority: 'low' },
    ],
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Column: React.FC<{ title: string; tasks: any[]; color: string }> = ({ title, tasks, color }) => (
    <div className="flex-1">
      <h3 className={`font-semibold text-sm ${color} mb-3`}>{title} ({tasks.length})</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-900">{task.title}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <button className="w-full mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            No tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Board</h2>
      <div className="flex flex-col space-x-6">
        <Column title="To Do" tasks={tasks.todo} color="text-blue-600" />
        <Column title="In Progress" tasks={tasks.inProgress} color="text-orange-600" />
        <Column title="Completed" tasks={tasks.completed} color="text-green-600" />
      </div>
    </div>
  );
};

export default TaskBoard;