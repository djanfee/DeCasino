import { toNano } from '@ton/core';
import { DeCasino } from '../wrappers/DeCasino';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const deCasino = provider.open(
        DeCasino.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('DeCasino')
        )
    );

    await deCasino.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(deCasino.address);

    console.log('ID', await deCasino.getID());
}
