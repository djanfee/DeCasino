import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { DeCasino } from '../wrappers/DeCasino';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('DeCasino', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('DeCasino');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let deCasino: SandboxContract<DeCasino>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deCasino = blockchain.openContract(
            DeCasino.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await deCasino.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: deCasino.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and deCasino are ready to use
    });

    // it('should increase counter', async () => {
    //     const increaseTimes = 3;
    //     for (let i = 0; i < increaseTimes; i++) {
    //         console.log(`increase ${i + 1}/${increaseTimes}`);

    //         const increaser = await blockchain.treasury('increaser' + i);

    //         const counterBefore = await deCasino.getCounter();

    //         console.log('counter before increasing', counterBefore);

    //         const increaseBy = Math.floor(Math.random() * 100);

    //         console.log('increasing by', increaseBy);

    //         const increaseResult = await deCasino.sendIncrease(increaser.getSender(), {
    //             increaseBy,
    //             value: toNano('0.05'),
    //         });

    //         expect(increaseResult.transactions).toHaveTransaction({
    //             from: increaser.address,
    //             to: deCasino.address,
    //             success: true,
    //         });

    //         const counterAfter = await deCasino.getCounter();

    //         console.log('counter after increasing', counterAfter);

    //         expect(counterAfter).toBe(counterBefore + increaseBy);
    //     }
    // });
    it('should wrong address', async () => {
        const wrongAddresser = await blockchain.treasury('wrongAddresser');
        const increaseResult = await deCasino.sendCheckAddress(wrongAddresser.getSender(), {
            value: toNano('0.05'),
            queryID: 1,
        });
        expect(increaseResult.transactions).toHaveTransaction({
            from: wrongAddresser.address,
            to: deCasino.address,
            success: false,
            exitCode: 333,
        });

        console.dir(increaseResult, { depth: null });
    });
});
