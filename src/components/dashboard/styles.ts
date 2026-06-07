import { StyleSheet } from 'react-native';

export const dashboardStyles = StyleSheet.create({
	safeArea: { flex: 1 },
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	loadingText: {
		marginTop: 16,
		color: '#333',
		fontSize: 16,
		fontWeight: '900',
		letterSpacing: 1,
	},
	trainInfoText: {
		marginTop: 8,
		color: '#666',
		fontSize: 12,
		letterSpacing: 2,
	},
	errorBox: {
		marginTop: 32,
		backgroundColor: '#000',
		padding: 20,
		borderRadius: 12,
		width: '100%',
		borderLeftWidth: 4,
		borderLeftColor: '#EF4444',
	},
	errorText: {
		color: '#FFF',
		textAlign: 'left',
		marginBottom: 16,
		lineHeight: 20,
		fontSize: 13,
		fontFamily: 'monospace',
	},
	retryBtn: {
		backgroundColor: '#EF4444',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	retryText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
	content: { flex: 1, padding: 20, justifyContent: 'space-between' },
});
