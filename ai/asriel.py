import wavedata
import Q

AUDIO_DIR = "~/Desktop/coding/asriel/audio"
MODEL = 'model.Q'
FREQ = 100
INPUT_SIZE = 1

inp = Q.Input('audio', wavedata.listaudio(AUDIO_DIR), (1, 1))

out = Q.Delay(1)(inp())
model = Q.Layers([
	Q.MixMod(1, 16, 16),
	Q.MixMod(16, 1, 16)
])

train = Q.Trainer(model, out)
loss = model.loss(inp(), out)

with Q.Do(inp, train, MODEL) as sess:
	while sess.step():
		if sess.report(FREQ):
			print "REPORT", sess.run(loss)
			sess.save()
	print "Done?"
