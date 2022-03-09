import { Spinner } from 'react-bootstrap'
import styled from 'styled-components'

const CustomSpinner = styled(Spinner)`
	width: 150px;
	height: 150px;
	margin: auto;
	display: inline-block;
    vertical-align: -0.125em;
    border: 0.25em solid #d63c5e;
    border-right-color: transparent !important;
    border-radius: 50% !important;
    animation: .75s linear infinite spinner-border;
	&.primary {
		border: 0.25em solid #d63c5e;
	}
	&.secondary {
		border: 0.25em solid #0CF;
	}
`

const UISpinner = ({ color }) => {
	return (
		<CustomSpinner animation="border" role="status" className={color}>
		</CustomSpinner>
	)
}

export default UISpinner