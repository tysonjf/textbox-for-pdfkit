import { Images } from './Images';
import { Oneline } from './Oneline';
import { Texts } from './Texts';
import { useLocalStorage, type StorageValue } from './utils/use-local-storage';

function App() {
	const [tab, setTab] = useLocalStorage<StorageValue>('tab', 'textbox');

	const tabs = [
		{ id: 'textbox', label: 'Textbox' },
		{ id: 'oneline', label: 'One Line Textbox' },
		{ id: 'images', label: 'Images' },
	];

	return (
		<div className='p-4'>
			<nav className='flex gap-1 p-1 bg-gray-100 rounded-lg w-fit'>
				{tabs.map(({ id, label }) => (
					<button
						key={id}
						onClick={() => setTab(id as StorageValue)}
						className={`px-4 py-1 rounded-md transition-colors text-sm ${
							tab === id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-700'
						}`}
					>
						{label}
					</button>
				))}
			</nav>

			{tab === 'textbox' && <Texts />}
			{tab === 'oneline' && <Oneline />}
			{tab === 'images' && <Images />}
		</div>
	);
}

export default App;
