import NounInfo from '../components/Main/NounInfo'
import NounEveryDay from '../components/Main/NounEveryDay'
import BlogInformation from '../components/Main/BlogInformation'

const Main = () => {
	return (
		<div className="content-wrapper">
			<NounInfo />
			<NounEveryDay />
			<BlogInformation />
		</div>
	)
}

export default Main