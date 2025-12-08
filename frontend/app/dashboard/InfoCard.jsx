export const InfoCard = ({ icon: Icon, label, value, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mb-3`}>
                <Icon className={color.replace('bg-', 'text-')} size={20} />
            </div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</p>
        </div>
    )
};